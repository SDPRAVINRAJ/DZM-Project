function generateFallbackTamilWelcome(
  type: string,
  title: string,
  date: string,
  time: string,
  venue: string
): string {
  const isComp = type.includes("போட்டி") || type === "competition";
  const formattedTime = time ? ` ${time}` : "";
  const formattedVenue = venue ? ` ${venue}` : " பள்ளி வளாகத்தில்";

  if (isComp) {
    return `அன்பான மாணவச் செல்வங்களே! நமது பள்ளியில் ${date} அன்று${formattedTime}${formattedVenue} மிகச் சிறப்பாக நடைபெறவுள்ள "${title}" போட்டியில் கலந்துகொள்ள உங்களை அன்புடன் அழைக்கிறோம்! 🏆 உங்கள் தனித்துவமான திறமைகளையும் படைப்பாற்றலையும் வெளிப்படுத்த இது ஒரு சிறந்த வாய்ப்பாகும். அனைத்து மாணவர்களும் உற்சாகத்துடன் பங்கேற்று வெற்றி பெற வாழ்த்துகிறோம்! 🌟`;
  }

  return `அன்பான மாணவச் செல்வங்களே! நமது பள்ளியில் ${date} அன்று${formattedTime}${formattedVenue} மிக விமரிசையாக நடைபெறவுள்ள "${title}" நிகழ்வில் பங்குபெற உங்களை மகிழ்ச்சியுடன் வரவேற்கிறோம்! 🌟 இந்நிகழ்வு நமது பள்ளி மாணவர்களின் கலை, இலக்கிய மற்றும் கலாச்சாரப் பண்புகளை வளர்க்கும் ஒரு இனிய தளமாகும். அனைவரும் தவறாமல் கலந்துகொண்டு சிறப்பிக்குமாறு அன்போடு கேட்டுக்கொள்கிறோம்! ✨`;
}

export interface GenerateEventContentParams {
  type: string;
  title: string;
  date: string;
  time?: string;
  venue?: string;
}

export async function generateEventWelcomeContent({
  type,
  title,
  date,
  time = "",
  venue = "",
}: GenerateEventContentParams): Promise<{ success: boolean; content: string; error?: string }> {
  try {
    if (!type || !title || !date) {
      return {
        success: false,
        content: "",
        error: "முதலில் தேவையான அனைத்து நிகழ்வு விவரங்களையும் உள்ளிடவும்.",
      };
    }

    const cleanType = type.includes("போட்டி") || type === "competition" ? "போட்டி" : "நிகழ்வு";
    const cleanTitle = title.trim();
    const cleanDate = date.trim();
    const cleanTime = (time || "").toString().trim();
    const cleanVenue = (venue || "").toString().trim();

    const apiKey =
      process.env.NEXT_PUBLIC_VITE_GEMINI_API_KEY_4 ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY_4 ||
      process.env.GEMINI_API_KEY;

    const systemPrompt = `நீங்கள் மலேசியப் பள்ளி மாணவர்களுக்காக எழுதும் திறமையான தமிழ் அறிவிப்பு எழுத்தாளர்.

ஆசிரியர் வழங்கிய நிகழ்வு அல்லது போட்டித் தகவல்களின் அடிப்படையில், மாணவர்களை அன்புடன் வரவேற்று உற்சாகமாகப் பங்கேற்கத் தூண்டும் படைப்பாற்றலான தமிழ் அறிவிப்பை உருவாக்கவும்.

முக்கிய விதிகள்:
1. மாணவர்களை அன்புடன் வரவேற்கும் இறுதி தமிழ் உரையை மட்டும் வழங்கவும். முன்னுரை, தலைப்புகள், குறியீடுகள் அல்லது விளக்கங்கள் எதுவும் சேர்க்க வேண்டாம்.
2. 80 முதல் 120 சொற்களுக்குள் இயற்கையான, பிழையற்ற தமிழில் அமைய வேண்டும்.
3. அறிவிப்பு வகை (${cleanType}), தலைப்பு (${cleanTitle}), தேதி (${cleanDate}), நேரம் (${cleanTime}), இடம் (${cleanVenue}) ஆகியவற்றை இயல்பாக உள்ளடக்க வேண்டும்.
4. அதிகபட்சம் 2 பொருத்தமான எமோஜிகளைப் பயன்படுத்தலாம்.`;

    const userPrompt = `அறிவிப்பு விவரங்கள்:
வகை: ${cleanType}
தலைப்பு: ${cleanTitle}
தேதி: ${cleanDate}
நேரம்: ${cleanTime || "காலை"}
இடம்: ${cleanVenue || "பள்ளி பிரதான மண்டபம்"}

மாணவர்களுக்கான அழகான வரவேற்பு அறிவிப்பை உருவாக்குக.`;

    // If Gemini API key is configured, query Gemini
    if (apiKey) {
      const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
      for (const modelName of models) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 350,
              },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text && text.trim().length > 10) {
              const sanitized = text
                .replace(/^```[\s\S]*?```/g, "")
                .replace(/[#*`_~]/g, "")
                .trim();
              return { success: true, content: sanitized };
            }
          }
        } catch {
          // Fall through to next model or fallback
        }
      }
    }

    // High quality Tamil generator fallback
    const fallbackText = generateFallbackTamilWelcome(
      cleanType,
      cleanTitle,
      cleanDate,
      cleanTime,
      cleanVenue
    );

    return {
      success: true,
      content: fallbackText,
    };
  } catch (error: any) {
    console.error("[AI Generation Error]", error);
    return {
      success: false,
      content: "",
      error: "வரவேற்பை உருவாக்க முடியவில்லை. மீண்டும் முயற்சி செய்யவும்.",
    };
  }
}
