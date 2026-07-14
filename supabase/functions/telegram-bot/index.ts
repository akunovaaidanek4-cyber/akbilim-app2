import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const TG_TOKEN = Deno.env.get("TG_TOKEN") ?? "8739556192:AAHpG0Od1DeqaYkbVtTu1jD0I0WGnyG6T1w";
const SB_URL   = Deno.env.get("SUPABASE_URL") ?? "https://odicvebknzkbxgclwlfx.supabase.co";
const SB_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const TG_CHAT  = "583874846"; // координатор

const TG_API = `https://api.telegram.org/bot${TG_TOKEN}`;

async function tgCall(method: string, body: unknown) {
  await fetch(`${TG_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function sbPatch(table: string, id: number | string, data: Record<string, unknown>) {
  await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

async function sbGet(table: string, filter: string) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?${filter}`, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });
  return r.ok ? r.json() : [];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { status: 200 });

  try {
    const update = await req.json();

    // ── Обработка inline-кнопок ──
    if (update.callback_query) {
      const cq   = update.callback_query;
      const data = cq.data as string;

      // ── Педагог берёт лид ──
      if (data.startsWith("take_")) {
        const [, leadId, teacherId] = data.split("_");

        const leads = await sbGet("ak_leads", `id=eq.${leadId}`);
        const lead  = leads[0];
        if (!lead) {
          await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: "Лид не найден" });
          return new Response("ok");
        }
        if (lead.status !== "new" || lead.teacherId) {
          await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: "❌ Лид уже взят другим педагогом" });
          return new Response("ok");
        }

        const teachers = await sbGet("ak_teachers", `id=eq.${teacherId}`);
        const teacher  = teachers[0];
        if (!teacher) {
          await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: "Педагог не найден" });
          return new Response("ok");
        }

        // Назначаем
        await sbPatch("ak_leads", leadId, {
          status: "trial",
          teacherId: Number(teacherId),
          teacherName: teacher.name,
        });

        // Сообщение педагогу
        await tgCall("editMessageText", {
          chat_id: cq.message.chat.id,
          message_id: cq.message.message_id,
          text: `✅ <b>Отлично! Ты берёшь ${lead.childName}</b>\n📞 Позвони родителю: <b>${lead.parentPhone}</b>\n👤 ${lead.parentName || "—"}\n📍 ${lead.district}`,
          parse_mode: "HTML",
        });

        // Уведомить координатора
        await tgCall("sendMessage", {
          chat_id: TG_CHAT,
          text: `✅ <b>${lead.childName}</b> взял педагог <b>${teacher.name}</b>\n📍 ${lead.district}\n📞 ${lead.parentPhone}`,
          parse_mode: "HTML",
        });

        await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: `✅ Принято! Позвони ${lead.parentPhone}` });
      }

      // ── Педагог не может взять лид → эскалация ──
      else if (data.startsWith("cant_")) {
        const [, leadId, teacherId] = data.split("_");

        const leads = await sbGet("ak_leads", `id=eq.${leadId}`);
        const lead  = leads[0];
        if (!lead) {
          await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: "Лид не найден" });
          return new Response("ok");
        }
        if (lead.status !== "new" || lead.teacherId) {
          await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: "Лид уже назначен" });
          return new Response("ok");
        }

        // Добавить в список отказавших
        const notified: number[] = Array.isArray(lead.notifiedTeachers) ? lead.notifiedTeachers : [];
        if (!notified.includes(Number(teacherId))) notified.push(Number(teacherId));
        await sbPatch("ak_leads", leadId, { notifiedTeachers: notified });

        // Найти следующего педагога района с telegramId
        const allTeachers = await sbGet("ak_teachers", `role=eq.teacher&select=id,name,telegramId,districts`);
        const next = (allTeachers as any[]).find((t: any) =>
          t.telegramId &&
          !notified.includes(Number(t.id)) &&
          (!t.districts?.length || (t.districts as string[]).includes(lead.district))
        );

        if (next) {
          const msgText = `🆕 <b>Новый ученик!</b>\n👶 <b>${lead.childName}</b>${lead.grade ? `, ${lead.grade}` : ""}\n📍 ${lead.district}${lead.subject ? `\n📚 ${lead.subject}` : ""}${lead.notes ? `\n💬 ${lead.notes}` : ""}\n\n✅ Возьмёшь этого ученика?`;
          await tgCall("sendMessage", {
            chat_id: next.telegramId,
            text: msgText,
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [[
                { text: "✅ Беру!", callback_data: `take_${leadId}_${next.id}` },
                { text: "❌ Не могу", callback_data: `cant_${leadId}_${next.id}` },
              ]],
            },
          });
          // Обновить notifiedAt только при первом уведомлении
          if (!lead.notifiedAt) {
            await sbPatch("ak_leads", leadId, { notifiedAt: new Date().toISOString() });
          }
        } else {
          // Все педагоги района отказали — уведомить координатора
          await tgCall("sendMessage", {
            chat_id: TG_CHAT,
            text: `⚠️ <b>Лид не взят!</b> Ни один педагог района <b>${lead.district}</b> не может взять <b>${lead.childName}</b>.\n📞 ${lead.parentPhone}\n\nНазначьте педагога вручную.`,
            parse_mode: "HTML",
          });
        }

        // Обновить сообщение у текущего педагога
        await tgCall("editMessageText", {
          chat_id: cq.message.chat.id,
          message_id: cq.message.message_id,
          text: `↩️ Понято, передаём лид <b>${lead.childName}</b> дальше.`,
          parse_mode: "HTML",
        });
        await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: "Передаём следующему педагогу" });
      }

      // ── Координатор назначает педагога вручную (старый flow) ──
      else if (data.startsWith("assign_")) {
        const [, leadId, teacherId] = data.split("_");

        const teachers = await sbGet("ak_teachers", `id=eq.${teacherId}`);
        const teacher  = teachers[0];
        if (!teacher) {
          await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: "Педагог не найден" });
          return new Response("ok");
        }

        const leads = await sbGet("ak_leads", `id=eq.${leadId}`);
        const lead  = leads[0];
        if (!lead) {
          await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: "Лид не найден" });
          return new Response("ok");
        }

        await sbPatch("ak_leads", leadId, {
          status: "trial",
          teacherId: Number(teacherId),
          teacherName: teacher.name,
        });

        const text = `✅ <b>${lead.childName}</b> назначен(а) педагогу <b>${teacher.name}</b>\n📍 ${lead.district}\n📞 ${lead.parentPhone}`;
        await tgCall("editMessageText", {
          chat_id: cq.message.chat.id,
          message_id: cq.message.message_id,
          text,
          parse_mode: "HTML",
        });
        await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: `✅ Назначен: ${teacher.name}` });
      }

      // ── Вечерний отчёт ──
      else if (data === "evening_report") {
        const [leadsAll, students, reports] = await Promise.all([
          sbGet("ak_leads", "order=id.desc"),
          sbGet("ak_students", "order=id.desc"),
          sbGet("ak_reports", "order=id.desc&limit=50"),
        ]);
        const newL    = (leadsAll as any[]).filter((l: any) => l.status === "new").length;
        const trialL  = (leadsAll as any[]).filter((l: any) => l.status === "trial").length;
        const today   = new Date().toLocaleDateString("ru-RU");
        const todayR  = (reports as any[]).filter((r: any) => r.date === today);

        // Зависшие лиды: status=new и notifiedAt старше 20 минут (или createdAt старше 60 минут)
        const now = Date.now();
        const stuckLeads = (leadsAll as any[]).filter((l: any) => {
          if (l.status !== "new") return false;
          if (l.notifiedAt) {
            return (now - new Date(l.notifiedAt).getTime()) > 20 * 60 * 1000;
          }
          // Нет notifiedAt — считаем зависшим если лид создан давно (нет точной метки createdAt в ISO)
          return false;
        });

        const stuckLines = stuckLeads.map((l: any) => {
          const minsAgo = l.notifiedAt ? Math.round((now - new Date(l.notifiedAt).getTime()) / 60000) : "?";
          return `  • ${l.childName} — ${l.district} (${minsAgo} мин назад)`;
        });

        const lines = [
          `📊 <b>Вечерний отчёт AK BILIM</b> — ${today}`,
          ``,
          `👶 Учеников всего: <b>${(students as any[]).length}</b>`,
          `🆕 Новых лидов: <b>${newL}</b>`,
          `🧪 На пробном: <b>${trialL}</b>`,
          `📝 Уроков сегодня: <b>${todayR.filter((r: any) => r.type === "lesson").length}</b>`,
          `🧪 Пробных сегодня: <b>${todayR.filter((r: any) => r.type === "trial").length}</b>`,
        ];

        if (stuckLeads.length > 0) {
          lines.push(``);
          lines.push(`🚨 <b>Зависших лидов: ${stuckLeads.length}</b> (никто не взял за 20+ мин)`);
          lines.push(...stuckLines);
        }

        await tgCall("editMessageText", {
          chat_id: cq.message.chat.id,
          message_id: cq.message.message_id,
          text: lines.join("\n"),
          parse_mode: "HTML",
        });
        await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: "Отчёт готов!" });
      }

      return new Response("ok");
    }

    // ── Команды через чат ──
    if (update.message) {
      const msg  = update.message;
      const text = (msg.text ?? "") as string;
      const chatId = msg.chat.id;

      if (text === "/myid" || text === "/start") {
        await tgCall("sendMessage", {
          chat_id: chatId,
          text: `Ваш Telegram ID: <code>${chatId}</code>\n\nСкажите администратору, чтобы он внёс это число в ваш профиль педагога. После этого вы будете получать новых учеников прямо сюда.`,
          parse_mode: "HTML",
        });
      }

      if (text === "/report" || text === "/отчёт") {
        await tgCall("sendMessage", {
          chat_id: chatId,
          text: "📊 Запросить вечерний отчёт:",
          reply_markup: {
            inline_keyboard: [[{ text: "📊 Показать отчёт", callback_data: "evening_report" }]],
          },
        });
      }
    }

    return new Response("ok");
  } catch (e) {
    console.error(e);
    return new Response("error", { status: 500 });
  }
});
