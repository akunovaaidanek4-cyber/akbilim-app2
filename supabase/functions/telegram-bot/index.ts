import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const TG_TOKEN = Deno.env.get("TG_TOKEN") ?? "8739556192:AAHpG0Od1DeqaYkbVtTu1jD0I0WGnyG6T1w";
const SB_URL   = Deno.env.get("SUPABASE_URL") ?? "https://odicvebknzkbxgclwlfx.supabase.co";
const SB_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

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

    // ── Обработка inline-кнопки (coordinator assigns teacher to lead) ──
    if (update.callback_query) {
      const cq   = update.callback_query;
      const data = cq.data as string;

      if (data.startsWith("assign_")) {
        const [, leadId, teacherId] = data.split("_");

        // Загружаем педагога
        const teachers = await sbGet("ak_teachers", `id=eq.${teacherId}`);
        const teacher  = teachers[0];
        if (!teacher) {
          await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: "Педагог не найден" });
          return new Response("ok");
        }

        // Загружаем лид
        const leads = await sbGet("ak_leads", `id=eq.${leadId}`);
        const lead  = leads[0];
        if (!lead) {
          await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: "Лид не найден" });
          return new Response("ok");
        }

        // Назначаем педагога
        await sbPatch("ak_leads", leadId, {
          status: "trial",
          teacherId: Number(teacherId),
          teacherName: teacher.name,
        });

        // Обновляем сообщение
        const text = `✅ <b>${lead.childName}</b> назначен(а) педагогу <b>${teacher.name}</b>\n📍 ${lead.district}\n📞 ${lead.parentPhone}`;
        await tgCall("editMessageText", {
          chat_id: cq.message.chat.id,
          message_id: cq.message.message_id,
          text,
          parse_mode: "HTML",
        });
        await tgCall("answerCallbackQuery", { callback_query_id: cq.id, text: `✅ Назначен: ${teacher.name}` });
      }

      // Кнопка "Вечерний отчёт"
      if (data === "evening_report") {
        const [leadsAll, students, reports] = await Promise.all([
          sbGet("ak_leads", "order=id.desc"),
          sbGet("ak_students", "order=id.desc"),
          sbGet("ak_reports", "order=id.desc&limit=50"),
        ]);
        const newL    = (leadsAll as any[]).filter((l: any) => l.status === "new").length;
        const trialL  = (leadsAll as any[]).filter((l: any) => l.status === "trial").length;
        const today   = new Date().toLocaleDateString("ru-RU");
        const todayR  = (reports as any[]).filter((r: any) => r.date === today);

        const text = [
          `📊 <b>Вечерний отчёт AK BILIM</b> — ${today}`,
          ``,
          `👶 Учеников всего: <b>${(students as any[]).length}</b>`,
          `🆕 Новых лидов: <b>${newL}</b>`,
          `🧪 На пробном: <b>${trialL}</b>`,
          `📝 Уроков сегодня: <b>${todayR.filter((r: any) => r.type === "lesson").length}</b>`,
          `🧪 Пробных сегодня: <b>${todayR.filter((r: any) => r.type === "trial").length}</b>`,
        ].join("\n");

        await tgCall("editMessageText", {
          chat_id: cq.message.chat.id,
          message_id: cq.message.message_id,
          text,
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
