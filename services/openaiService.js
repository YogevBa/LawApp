import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../localization/i18n';
import ENV from '../env.js';

// API URL for OpenAI
const API_URL = ENV.API_URL;
const DEFAULT_MODEL = ENV.DEFAULT_MODEL;
const USE_MOCK_DATA = ENV.USE_MOCK_DATA;

/**
 * Mock analyses for different fine scenarios
 */
const mockAnalyses = {
  correct: {
    summary: 'Based on a thorough review of your fine details, there appear to be legitimate grounds for contesting this violation. Several procedural and technical issues are identified that may invalidate the fine.',
    keyPoints: [
      'The time and location details suggest possible improper signage or markings',
      'The equipment used for recording this violation may not have been properly calibrated',
      'The specific wording of the violation may not align with current regulations',
      'Similar cases have been successfully appealed in the past based on comparable circumstances'
    ],
    recommendation: 'We recommend contesting this fine through the formal appeals process. The specific violations noted in our analysis provide strong grounds for having the fine reduced or dismissed entirely.',
    result: 'correct'
  },
  partially: {
    summary: 'After analyzing your fine, we have found some potential issues with how it was issued, though the underlying violation itself appears valid. There may be grounds for requesting a reduction rather than a complete dismissal.',
    keyPoints: [
      'The violation itself appears to be legitimate based on the described circumstances',
      'The fine amount seems disproportionate compared to similar violations',
      'There may be mitigating factors not considered when the fine was issued',
      'Your driving record and history could be relevant in negotiating the penalty'
    ],
    recommendation: 'Consider requesting a reduction in the fine amount or alternative penalties such as traffic school. While complete dismissal is unlikely, there are grounds to negotiate more favorable terms.',
    result: 'partially'
  },
  incorrect: {
    summary: 'After a thorough analysis of your fine, we have determined that it appears to be valid according to current traffic regulations. The documentation and circumstances described align with standard enforcement practices.',
    keyPoints: [
      'The violation is clearly defined and properly documented',
      'The fine amount is consistent with current penalty schedules',
      'No procedural errors were identified in how the fine was issued',
      'The evidence provided strongly supports the violation charge'
    ],
    recommendation: 'Based on our analysis, we recommend paying this fine before the due date to avoid additional penalties. Contesting this fine would likely be unsuccessful given the clear documentation and proper procedure followed.',
    result: 'incorrect'
  }
};

/**
 * Retrieves API key from various sources
 * First checks AsyncStorage, then falls back to .env
 */
const getApiKey = async () => {
  try {
    // Try to get API key from AsyncStorage first (user-provided key)
    const storedApiKey = await AsyncStorage.getItem('@openai_api_key');
    if (storedApiKey) {
      return storedApiKey;
    }
    // Fall back to environment variable if available
    if (ENV.OPENAI_API_KEY) {
      return ENV.OPENAI_API_KEY;
    }
    return ""; // Return empty string if not found
  } catch (error) {
    console.error('Error loading API key:', error);
    // Fall back to environment variable if available
    if (ENV.OPENAI_API_KEY) {
      return ENV.OPENAI_API_KEY;
    }
    return "";
  }
};

/**
 * Function to save API key to AsyncStorage
 */
const saveApiKey = async (apiKey) => {
  try {
    await AsyncStorage.setItem('@openai_api_key', apiKey);
    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    return false;
  }
};

/**
 * Analyzes a fine report using OpenAI's GPT model
 * @param {Object} fineReport - The fine report data
 * @returns {Promise<Object>} - Analysis results including recommendation
 */
export async function analyzeFineReport(fineReport) {
  console.log("analyzeFineReport called with:", fineReport);
  
  try {
    // Get current app language
    const currentLocale = i18n.locale || 'en';
    console.log("Current app language:", currentLocale);
    
    // Check if we have a cached response for this report in the current language
    const cacheKey = `analysis_${fineReport.reportNumber}_${currentLocale}`;
    console.log("Checking cache with key:", cacheKey);
    const cachedResult = await AsyncStorage.getItem(cacheKey);
    
    if (cachedResult) {
      console.log("Found cached result for language " + currentLocale + ", returning it");
      return JSON.parse(cachedResult);
    }
    
    console.log("No cached result found, proceeding with API call");
    
    // Check if we should use mock data
    if (USE_MOCK_DATA) {
      console.log("Using mock data for analysis");
      // Select a random mock analysis
      const mockResults = Object.values(mockAnalyses);
      const randomMock = mockResults[Math.floor(Math.random() * mockResults.length)];
      return randomMock;
    }
    
    // Get API key
    const apiKey = await getApiKey();
    console.log("Retrieved API key for analysis:", apiKey ? "API key found" : "No API key found");
    console.log('🔐 Final API Key:', apiKey); // <---- This line!
    if (!apiKey) {
      console.error("OpenAI API key is missing");
      throw new Error('OpenAI API key is missing - please set an API key in your profile settings');
    }
    
    // Additional logging for debugging
    console.log("API call will be made with this key for analysis")
    
    // Construct prompt for GPT
    const prompt = constructFineAnalysisPrompt(fineReport, currentLocale);
    console.log("Analysis prompt prepared for language:", currentLocale);
    
    // Make request to OpenAI API
    console.log("Making request to OpenAI API at:", API_URL);
    console.log("Using model:", DEFAULT_MODEL);
    
    // Determine system message based on language
    let systemMessage = '';
    if (currentLocale === 'he') {
      systemMessage = 'אתה עוזר משפטי המתמחה בעבירות תנועה וקנסות. תפקידך הוא לנתח דוחות קנסות תעבורה ולספק תובנות לגבי תקפותם ולהמליץ על פעולות בהתבסס על הפרטים שסופקו. חשוב מאוד שכל התשובה שלך תהיה בעברית.';
    } else {
      systemMessage = 'You are a legal assistant specializing in traffic violations and fines. Your task is to analyze traffic fine reports and provide insights on their validity and recommend actions based on the details provided.';
    }
    
    const requestBody = {
      model: DEFAULT_MODEL,
      messages: [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
    
    console.log("Request body:", JSON.stringify(requestBody));
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error("API error data:", JSON.stringify(errorData));
          throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
        } catch (parseError) {
          console.error("Error parsing API error response:", parseError);
          console.error("Status code:", response.status, "Status text:", response.statusText);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }
      
      console.log("Response OK, parsing JSON");
      const data = await response.json();
      console.log("Response data:", data);
      
      const analysisText = data.choices[0].message.content;
      console.log("Analysis received from OpenAI:", analysisText);
      
      // Parse the GPT response into structured data
      const analysisResult = parseAnalysisResponse(analysisText);
      
      // Cache the result with language-specific key
      await AsyncStorage.setItem(cacheKey, JSON.stringify(analysisResult));
      
      return analysisResult;
    } catch (fetchError) {
      console.error("Error during fetch operation:", fetchError);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error analyzing fine:', error);
    
    // Return a fallback analysis if the API call fails
    return {
      summary: 'Unable to connect to analysis service. Please check your connection and try again.',
      keyPoints: [
        'Analysis service unavailable',
        'Using offline fallback analysis'
      ],
      recommendation: 'Consider reviewing the fine manually or try again later.',
      result: 'error'
    };
  }
}

/**
 * Constructs a detailed prompt for the fine analysis
 * @param {Object} fineReport - The fine report data
 * @param {string} language - The language code ('en' or 'he')
 * @returns {string} - The prompt text in the appropriate language
 */
function constructFineAnalysisPrompt(fineReport, language = 'en') {
  const description = fineReport.description || 
                    (language === 'he' ? 'לא סופק תיאור נוסף' : 'No additional description provided');
  
  if (language === 'he') {
    return `
אנא נתח את דוח הקנס הזה וספק הערכה מפורטת:

דוח קנס מספר ${fineReport.reportNumber}
תאריך: ${fineReport.date}
מיקום: ${fineReport.location}
סוג העבירה: ${fineReport.violation}
סכום: ${fineReport.amount}
תאריך יעד לתשלום: ${fineReport.dueDate}
שם השוטר: ${fineReport.officerName || 'לא צוין'}
מספר תג: ${fineReport.badgeNumber || 'לא צוין'}

תיאור נוסף מהמקבל:
${description}

בהתבסס על כל הפרטים האלה, אנא ספק:
1. הערכה מסכמת של תקפות הקנס הזה
2. נקודות מפתח לשקול לגבי הקנס
3. המלצה על איזו פעולה על המקבל לנקוט
4. קביעה האם הקנס נראה "נכון", "חלקית נכון", או "לא נכון"

הערה: "נכון" משמעותו שלמקבל יש עילות תקפות לערער על הקנס. "חלקית" משמעותו שיתכן ויש עילות מסוימות לערעור או להפחתת הקנס. "לא נכון" משמעותו שהקנס נראה תקף וכנראה אין עילות לערעור עליו.

חשוב: גם אם חסרים פרטים מסוימים (כמו שם השוטר או מספר תג), יש להניח שהמידע הנחוץ לניתוח קיים ולהמשיך בניתוח מלא של המקרה. מחסור בפרטים מסוימים אינו בהכרח עילה לערעור על הקנס.

פרמט את התשובה שלך עם חלקים ברורים של סיכום, נקודות מפתח, המלצה, ושדה תוצאה עם אחד מהערכים האלה בלבד: "correct", "partially", או "incorrect".

חשוב מאוד: יש להשיב בעברית בלבד.
`;
  } else {
    return `
Please analyze this traffic fine report and provide a detailed assessment:

Fine Report #${fineReport.reportNumber}
Date: ${fineReport.date}
Location: ${fineReport.location}
Violation: ${fineReport.violation}
Amount: ${fineReport.amount}
Due Date: ${fineReport.dueDate}
Officer Name: ${fineReport.officerName || 'Not specified'}
Badge Number: ${fineReport.badgeNumber || 'Not specified'}

Additional Description from the recipient:
${description}

Based on all these details, please provide:
1. A summary assessment of the validity of this fine
2. Key points to consider about the fine
3. A recommendation on what action the recipient should take
4. A determination of whether the fine appears "correct", "partially correct", or "incorrect"

Note: "correct" means the recipient has valid grounds to contest the fine. "partially" means there may be some grounds to contest or reduce the fine. "incorrect" means the fine appears valid and there are likely no grounds to contest it.

Important: Even if certain details are missing (such as officer name or badge number), assume the necessary information for analysis exists and proceed with a full analysis of the case. Missing certain details is not necessarily grounds for contesting the fine.

Format your response with clear sections for Summary, Key Points, Recommendation, and a Result field with only one of these values: "correct", "partially", or "incorrect".

Important: Please respond in English only.
`;
  }
}

/**
 * Parses the GPT response into structured data
 */
function parseAnalysisResponse(responseText) {
  try {
    // Default fallback values
    let result = {
      summary: responseText, // Use the full response text as the summary by default
      keyPoints: [],
      recommendation: 'Please review the details of your fine.',
      result: 'partially' // Default to partially if parsing fails
    };
    
    // Try to extract structured sections if they exist in the text
    // Extract summary
    const summaryMatch = responseText.match(/Summary:(.+?)(?=Key Points:|$)/s) || 
                         responseText.match(/### Summary(.+?)(?=###|$)/s);
    if (summaryMatch && summaryMatch[1]) {
      result.summary = summaryMatch[1].trim();
    }
    
    // Extract key points
    const keyPointsMatch = responseText.match(/Key Points:(.+?)(?=Recommendation:|$)/s) || 
                           responseText.match(/### Key Points(.+?)(?=###|$)/s);
    if (keyPointsMatch && keyPointsMatch[1]) {
      // Split by numbered points or bullet points
      let keyPoints = keyPointsMatch[1]
        .split(/\d+\.|\n-|\n•|\*\*\*\*|\n\d+\)/)
        .map(point => point.trim())
        .filter(point => point.length > 0);
      
      // Fix Hebrew points with a colon after the first letter and remove asterisks
      if (i18n.locale === 'he') {
        keyPoints = keyPoints.map(point => {
          // Remove colon after first letter and any extra whitespace, and remove asterisks
          return point.replace(/^(.):\s*/,'$1').replace(/\*/g, '');
        });
      }
      
      result.keyPoints = keyPoints;
    }
    
    // Extract recommendation
    const recommendationMatch = responseText.match(/Recommendation:(.+?)(?=Result:|$)/s) || 
                               responseText.match(/### Recommendation(.+?)(?=###|$)/s);
    if (recommendationMatch && recommendationMatch[1]) {
      result.recommendation = recommendationMatch[1].trim();
    }
    
    // Extract result classification - look for the explicit Result field or for the string "correct", "partially", "incorrect" at the end
    const resultMatch = responseText.match(/Result:\s*(correct|partially|incorrect)/i) || 
                        responseText.match(/### Result\s*(correct|partially|incorrect)/i) ||
                        responseText.match(/\*\*(correct|partially|incorrect)\*\*/i);
    if (resultMatch && resultMatch[1]) {
      result.result = resultMatch[1].toLowerCase();
    }
    
    console.log("Parsed analysis result:", result);
    return result;
  } catch (error) {
    console.error('Error parsing analysis response:', error);
    // If parsing fails, return the full text as the summary
    return {
      summary: responseText,
      keyPoints: ['The full analysis is provided in the summary section'],
      recommendation: 'Please review the detailed analysis provided above.',
      result: 'partially'
    };
  }
}

/**
 * Generates a cancellation request letter using GPT
 */
export async function generateCancellationRequest(fineReport, additionalInfo = '', fullAuto = true) {
  try {
    // Get current app language
    const currentLocale = i18n.locale || 'en';
    console.log("Current app language for cancellation request:", currentLocale);
    
    // Check cache with language-specific key
    const cacheKey = `cancellation_${fineReport.reportNumber}_${fullAuto ? 'auto' : 'assisted'}_${currentLocale}`;
    const cachedResult = await AsyncStorage.getItem(cacheKey);
    
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }
    
    // Create prompt in the appropriate language
    let promptContent = '';
    
    if (currentLocale === 'he') {
      promptContent = `
צור מכתב רשמי המבקש ביטול או הפחתה של דוח התנועה הבא:

דוח מספר ${fineReport.reportNumber}
תאריך: ${fineReport.date}
מיקום: ${fineReport.location}
עבירה: ${fineReport.violation}
סכום: ${fineReport.amount}
תאריך אחרון לתשלום: ${fineReport.dueDate || 'לא צוין'}
שם השוטר: ${fineReport.officerName || 'לא צוין'}
מספר תג: ${fineReport.badgeNumber || 'לא צוין'}
`;

      // Combine both the description from fineReport and any additional info
      let userClaims = "";
      if (fineReport.description && fineReport.description.trim().length > 0) {
        userClaims += `\nתיאור האירוע על-ידי המשתמש:\n${fineReport.description}\n`;
      }
      
      if (additionalInfo && additionalInfo.trim().length > 0) {
        userClaims += `\nמידע נוסף שסופק על ידי המקבל:\n${additionalInfo}\n`;
      }
      
      // Add the combined user claims to the prompt
      if (userClaims.length > 0) {
        promptContent += userClaims;
      }

      if (fullAuto) {
        promptContent += `\nצור מכתב בקשת ביטול מלא, רשמי ומקצועי עם כל המרכיבים הדרושים כולל כתובת, תאריך, שורת נושא, פנייה נאותה, פסקאות גוף, סיום, ומקום לחתימה. חשוב מאוד: המכתב חייב לכלול באופן ספציפי ולהתייחס לטענות המשתמש ולתיאור האירוע שהובא לעיל. השתמש בגרסת האירועים שלהם כבסיס עובדתי לטיעונים. הקפד לשלב את הטענות והחששות המדויקים שלהם במקומות המתאימים, ולתמוך בהם בהנמקה משפטית.`;
      } else {
        promptContent += `\nספק נקודות מרכזיות של טיעונים שאני יכול להשתמש בהם כדי לערער על קנס זה, בהתבסס על המידע שסופק כולל התיאור שלי של האירוע. בנה את הנקודות הללו כך שישלבו ויתבססו על גרסת האירועים והחששות שציינתי. התמקד הן בטענות הספציפיות שלי והן בהיבטים טכניים ופרוצדורליים הקשורים למידע שניתן.`;
      }
    } else {
      promptContent = `
Generate a formal letter requesting the cancellation or reduction of the following traffic fine:

Fine Report #${fineReport.reportNumber}
Date: ${fineReport.date}
Location: ${fineReport.location}
Violation: ${fineReport.violation}
Amount: ${fineReport.amount}
Due Date: ${fineReport.dueDate || 'Not specified'}
Officer Name: ${fineReport.officerName || 'Not specified'}
Badge Number: ${fineReport.badgeNumber || 'Not specified'}
`;

      // Combine both the description from fineReport and any additional info
      let userClaims = "";
      if (fineReport.description && fineReport.description.trim().length > 0) {
        userClaims += `\nUser's Description of Incident:\n${fineReport.description}\n`;
      }
      
      if (additionalInfo && additionalInfo.trim().length > 0) {
        userClaims += `\nAdditional Information Provided by the Recipient:\n${additionalInfo}\n`;
      }
      
      // Add the combined user claims to the prompt
      if (userClaims.length > 0) {
        promptContent += userClaims;
      }

      if (fullAuto) {
        promptContent += `\nGenerate a complete, formal and professional cancellation request letter with all necessary components including address, date, subject line, proper salutation, body paragraphs, closing, and space for signature. IMPORTANT: The letter must specifically incorporate and address the user's claims and description of the incident from above. Use their version of events as factual basis for arguments. Be sure to incorporate their exact concerns and arguments where appropriate, supporting them with legal reasoning.`;
      } else {
        promptContent += `\nProvide bullet points of factual arguments I can use to contest this fine, based on the information provided including my description of the incident. Structure these points to incorporate and build upon my stated version of events and concerns. Focus on both my specific claims and technical/procedural aspects related to the provided information.`;
      }
    }
    
    // Set system message based on language
    let systemMessage = '';
    if (currentLocale === 'he') {
      systemMessage = 'אתה עוזר משפטי המתמחה בכתיבת בקשות ביטול קנסות יעילות. תפקידך הוא ליצור בקשות ביטול מקצועיות ומבוססות אך ורק על המידע שסופק על ידי המשתמש. חשוב ביותר: אסור בהחלט להמציא או להוסיף פרטים שלא סופקו, להמציא תירוצים, או לטעון טענות שאינן מבוססות על המידע שניתן. היצמד באופן מוחלט לעובדות שסופקו, ואל תכלול שום מידע מומצא או תירוצים שקריים בבקשה. התשובה שלך חייבת להיות בעברית.';
    } else {
      systemMessage = 'You are a legal assistant specializing in writing effective fine cancellation requests. Your task is to generate professional and factual requests based STRICTLY on the information provided by the user. CRITICAL: You must NOT invent or add details that were not supplied, fabricate excuses, or make claims not supported by the provided information. Stick ONLY to the facts given, and do not include any made-up information or false excuses in the request.';
    }
    
    // Check if we should use mock data
    if (USE_MOCK_DATA) {
      console.log("Using mock data for cancellation request");
      return generateMockCancellationResponse(fineReport, fullAuto, currentLocale);
    }
    
    // Get API key
    const apiKey = await getApiKey();
    console.log("Retrieved API key for cancellation:", apiKey ? "API key found" : "No API key found");
    if (!apiKey) {
      console.error("OpenAI API key is missing");
      throw new Error('OpenAI API key is missing - please set an API key in your profile settings');
    }
    
    // Additional logging for debugging
    console.log("API call will be made with this key for cancellation")
    
    // Make request to OpenAI API
    try {
      console.log("Making request to OpenAI API for cancellation");
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          messages: [
            {
              role: 'system',
              content: systemMessage
            },
            {
              role: 'user',
              content: promptContent
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });
      console.log("Cancellation request API response status:", response.status);
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          console.error("API error data:", JSON.stringify(errorData));
          throw new Error(`OpenAI API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
        } catch (parseError) {
          console.error("Error parsing API error response:", parseError);
          console.error("Status code:", response.status, "Status text:", response.statusText);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      const result = {
        content: data.choices[0].message.content,
        type: fullAuto ? 'full_letter' : 'bullet_points'
      };
      
      // Cache the result with language-specific key
      await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
      
      return result;
    } catch (apiError) {
      console.error("API error:", apiError);
      // Rethrow the error instead of falling back to mock data
      throw new Error(`Failed to generate cancellation request: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Error generating cancellation request:', error);
    // Throw the error up to be handled in the UI
    throw error;
  }
}

/**
 * Generates a mock cancellation request for development/demo purposes
 */
function generateMockCancellationResponse(fineReport, fullAuto, locale) {
  const today = new Date().toISOString().split('T')[0];
  const userAddress = locale === 'he' ? "רחוב האלון 123, תל אביב, 6120101" : "123 Main Street, Anytown, CA 94538";
  const agencyAddress = locale === 'he' ? "מחלקת אכיפת תנועה\nעיריית תל אביב\nרחוב אבן גבירול 69\nתל אביב, 6420128" : "Traffic Enforcement Department\nCity of Anytown\n789 Government Plaza\nAnytown, CA 94538";
  
  if (fullAuto) {
    // Generate a complete letter
    if (locale === 'he') {
      return {
        content: `${today}

${userAddress}

לכבוד
${agencyAddress}

הנדון: בקשה לביטול דוח תנועה מספר ${fineReport.reportNumber}

שלום רב,

אני פונה אליכם בנוגע לדוח התנועה שמספרו ${fineReport.reportNumber}, אשר הונפק בתאריך ${fineReport.date} בגין "${fineReport.violation}" במיקום ${fineReport.location}.

לאחר בחינה מדוקדקת של נסיבות האירוע והדוח עצמו, אני מבקש/ת לערער על תקפות הדוח מהסיבות הבאות:

1. לא הייתה שילוט מספק או ברור במקום המציין את האיסור או ההגבלה הרלוונטית.
2. התיעוד של העבירה לוקה בחסר ואינו מספק הוכחה מספקת לביצוע העבירה הנטענת.
3. קיימות נסיבות מקלות אשר לא נלקחו בחשבון בעת הנפקת הדוח.
4. קיים ספק סביר לגבי דיוק המדידה או הזיהוי שבוצע על ידי השוטר או המכשיר שנעשה בו שימוש.

אני מבקש/ת כי תבחנו מחדש את הדוח לאור הנקודות שהעליתי ותשקלו לבטל אותו. במידה ויש צורך במידע נוסף או במסמכים תומכים, אשמח לספק אותם לפי דרישה.

אני מודה מראש על תשומת הלב והטיפול בבקשתי.

בכבוד רב,

____________________
חתימה

____________________
שם מלא

____________________
מספר תעודת זהות

____________________
תאריך`,
        type: 'full_letter'
      };
    } else {
      return {
        content: `${today}

${userAddress}

${agencyAddress}

Subject: Request for Cancellation of Traffic Citation #${fineReport.reportNumber}

To Whom It May Concern:

I am writing in regard to Traffic Citation #${fineReport.reportNumber} issued on ${fineReport.date} for "${fineReport.violation}" at location ${fineReport.location}.

After careful review of the circumstances and the citation itself, I respectfully request that this fine be dismissed for the following reasons:

1. There was inadequate or unclear signage at the location indicating the relevant prohibition or restriction.
2. The documentation of the alleged violation is insufficient and does not provide adequate evidence of the claimed offense.
3. There are mitigating circumstances that were not taken into account when the citation was issued.
4. There is reasonable doubt regarding the accuracy of the measurement or identification made by the officer or the equipment used.

I understand the importance of traffic regulations and their enforcement for public safety. However, I believe that in this specific instance, the citation was issued in error or under circumstances that warrant reconsideration.

I kindly request that you review this citation based on the points I have raised and consider dismissing it. If additional information or supporting documentation is needed, I would be happy to provide it upon request.

Thank you for your attention to this matter. I look forward to your response.

Sincerely,

____________________
Signature

____________________
Full Name

____________________
Driver's License Number

____________________
Date`,
        type: 'full_letter'
      };
    }
  } else {
    // Generate bullet points for arguments
    if (locale === 'he') {
      return {
        content: `• בחינת השילוט במקום האירוע - האם השילוט היה ברור, נראה לעין, ולא מוסתר על ידי עצים או מכשולים אחרים.

• אי-דיוקים בדוח - האם הפרטים בדוח (זמן, מיקום, תיאור העבירה) מדויקים ותואמים את המציאות.

• בעיות טכניות במכשור - אם מדובר במדידת מהירות או בדיקה טכנית אחרת, ייתכן שהמכשיר לא היה מכויל כראוי.

• טעויות פרוצדורליות - האם השוטר פעל בהתאם לכל נהלי האכיפה הנדרשים (זיהוי נאות, הצגת תעודה, הסבר מלא על העבירה).

• מצב כביש או תנאי מזג אוויר חריגים - תנאים שעשויים להשפיע על התנהגות הנהיגה או לטשטש סימונים/שילוט.

• עדויות סותרות - האם יש עדים או ראיות אובייקטיביות (תמונות, סרטונים) שסותרים את הטענות בדוח.`,
        type: 'bullet_points'
      };
    } else {
      return {
        content: `• Examine the signage at the location - Was the signage clear, visible, and not obstructed by trees or other obstacles.

• Inaccuracies in the citation - Are the details in the report (time, location, violation description) accurate and match reality.

• Technical issues with equipment - If speed measurement or other technical testing was involved, the device may not have been properly calibrated.

• Procedural errors - Did the officer follow all required enforcement procedures (proper identification, presenting credentials, full explanation of the violation).

• Unusual road conditions or weather - Conditions that might affect driving behavior or obscure markings/signage.

• Contradictory evidence - Are there witnesses or objective evidence (photos, videos) that contradict the claims in the citation.`,
        type: 'bullet_points'
      };
    }
  }
}

// API key management is now handled internally