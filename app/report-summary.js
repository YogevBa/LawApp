import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import { analyzeFine, selectFineById, selectFinesStatus, selectFinesError } from '../store/finesSlice';
import { useLanguage } from '../localization/i18n';


export default function ReportSummaryScreen() {
  const { t, locale } = useLanguage();
  const isRTL = locale === 'he';
  const { fineId, isNew, analysis: analysisParam } = useLocalSearchParams();
  const dispatch = useDispatch();
  
  // Get the fine from Redux store
  const currentFine = useSelector(state => selectFineById(state, fineId));
  const status = useSelector(selectFinesStatus);
  const error = useSelector(selectFinesError);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(''); // 'correct', 'partially', 'incorrect'
  const [showNewFineMessage, setShowNewFineMessage] = useState(isNew === 'true');
  // Don't try to parse JSON here as it can cause issues with double parsing
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(!analysisParam && !currentFine?.analysis);
  
  // Hide the success message after 5 seconds
  useEffect(() => {
    if (showNewFineMessage) {
      const timer = setTimeout(() => {
        setShowNewFineMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showNewFineMessage]);


  // Create a fallback report if no fine is found in Redux store
  const fallbackReport = {
    reportNumber: fineId || 'Unknown',
    date: new Date().toISOString().split('T')[0],
    location: 'Unknown location',
    violation: 'Unknown violation',
    amount: '$0.00',
    dueDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    officerName: 'Unknown',
    badgeNumber: 'Unknown',
  };
  
  // If we don't have a current fine but should have one based on the fineId, redirect to fines list
  useEffect(() => {
    if (fineId && !currentFine && !analysisParam) {
      console.log("Fine not found in Redux store, redirecting to fines list");
      router.replace('/(tabs)/fines');
    }
  }, [fineId, currentFine]);
  
  // Use the Redux store data or fallback
  const currentFineReport = currentFine || fallbackReport;

  // Helper function to detect result type from text with improved pattern matching
  const detectResultFromText = (text) => {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    console.log("Analyzing text for result determination");
    
    // First check: Force parse the result if it appears in the text as a distinct labeled value
    // This is a specific format pattern we're looking for at the end of the analysis
    if (text.includes("result:") || text.includes("result :") || 
        text.includes("Result:") || text.includes("Result :") || 
        text.includes("RESULT:") || text.includes("RESULT :") ||
        text.includes("תוצאה:") || text.includes("תוצאה :")) {
      
      console.log("Found explicit Result: label");
      
      // Extract the value after the result label
      let resultLine = "";
      const lines = text.split('\n');
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (lowerLine.includes("result:") || lowerLine.includes("result :") || 
            lowerLine.includes("תוצאה:") || lowerLine.includes("תוצאה :")) {
          resultLine = lowerLine;
          break;
        }
      }
      
      if (resultLine) {
        // Extract the value after the colon
        const valueAfterColon = resultLine.split(':')[1]?.trim().toLowerCase();
        
        if (valueAfterColon) {
          if (valueAfterColon.includes("correct") || 
              valueAfterColon.includes("in favor") ||
              valueAfterColon.includes("grounds") ||
              valueAfterColon.includes("appeal")) {
            console.log("Explicit result indicator points to 'correct'");
            return 'correct';
          }
          
          if (valueAfterColon.includes("incorrect") || 
              valueAfterColon.includes("valid") ||
              valueAfterColon.includes("legitimate") || 
              valueAfterColon.includes("should pay") ||
              valueAfterColon.includes("uphold")) {
            console.log("Explicit result indicator points to 'incorrect'");
            return 'incorrect';
          }
          
          if (valueAfterColon.includes("partial") || 
              valueAfterColon.includes("some merit") ||
              valueAfterColon.includes("compromise")) {
            console.log("Explicit result indicator points to 'partially'");
            return 'partially';
          }
        }
      }
    }
    
    // Also look for the result as a single word at the end of the text
    if (text.includes("\n\n")) {
      const parts = text.split("\n\n");
      const lastPart = parts[parts.length - 1].trim().toLowerCase();
      
      console.log("Special check - Last part of text:", lastPart);
      
      // Check if the last section is just a single result indicator
      if (lastPart === "correct") {
        console.log(`Found explicit result indicator: "correct"`);
        return 'correct';
      } else if (lastPart === "incorrect") {
        console.log(`Found explicit result indicator: "incorrect"`);
        return 'incorrect';
      } else if (lastPart === "partially") {
        console.log(`Found explicit result indicator: "partially"`);
        return 'partially';
      }
    }
    
    // Regular check for explicit result in the last few lines - give more weight to explicit result indicators
    const lastFewLines = text.split('\n').slice(-7).join(' ').toLowerCase();
    console.log("Last few lines:", lastFewLines);
    
    // Expanded patterns to match more result values in specific formats
    const correctMatches = lastFewLines.match(/\b(correct|in favor|favorable|approve|cancel|dismiss|overturn|should contest|recommend contesting|successful appeal)\b/g);
    const incorrectMatches = lastFewLines.match(/\b(incorrect|not in favor|unfavorable|uphold|maintain|valid|proper|legitimate|should pay|recommend paying|unlikely to succeed)\b/g);
    const partialMatches = lastFewLines.match(/\b(partially|partial|some merit|compromise|reduce|reduction|negotiate|limited grounds)\b/g);
    
    // Give stronger weight to conclusive indicators in the end section
    if (correctMatches && correctMatches.length > 0 && 
       (incorrectMatches?.length || 0) < correctMatches.length &&
       (partialMatches?.length || 0) < correctMatches.length) {
      console.log(`Found ${correctMatches.length} clear 'correct' indicators in last few lines`);
      return 'correct';
    } else if (incorrectMatches && incorrectMatches.length > 0 && 
              (!partialMatches || incorrectMatches.length > partialMatches.length)) {
      console.log(`Found ${incorrectMatches.length} clear 'incorrect' indicators in last few lines`);
      return 'incorrect';
    } else if (partialMatches && partialMatches.length > 0) {
      console.log(`Found ${partialMatches.length} 'partially' indicators in last few lines`);
      return 'partially';
    }
    
    // Check for structured result section (Hebrew/English)
    if (text.includes("### תוצאה") || text.includes("### RESULT") || text.includes("### Result") ||
        text.includes("## תוצאה") || text.includes("## RESULT") || text.includes("## Result") ||
        text.includes("תוצאה:") || text.includes("RESULT:") || text.includes("Result:")) {
      console.log("Found structured result section");
      let resultPart = "";
      
      // Extract the result section using different patterns
      if (text.includes("### תוצאה")) {
        resultPart = text.split("### תוצאה")[1]?.split("###")[0]?.trim() || "";
      } else if (text.includes("## תוצאה")) {
        resultPart = text.split("## תוצאה")[1]?.split("##")[0]?.trim() || "";
      } else if (text.includes("תוצאה:")) {
        resultPart = text.split("תוצאה:")[1]?.split("\n\n")[0]?.trim() || "";
      } else if (text.includes("### RESULT")) {
        resultPart = text.split("### RESULT")[1]?.split("###")[0]?.trim() || "";
      } else if (text.includes("## RESULT")) {
        resultPart = text.split("## RESULT")[1]?.split("##")[0]?.trim() || "";
      } else if (text.includes("RESULT:")) {
        resultPart = text.split("RESULT:")[1]?.split("\n\n")[0]?.trim() || "";
      } else if (text.includes("### Result")) {
        resultPart = text.split("### Result")[1]?.split("###")[0]?.trim() || "";
      } else if (text.includes("## Result")) {
        resultPart = text.split("## Result")[1]?.split("##")[0]?.trim() || "";
      } else if (text.includes("Result:")) {
        resultPart = text.split("Result:")[1]?.split("\n\n")[0]?.trim() || "";
      }
      
      console.log("Result section found:", resultPart);
      
      if (resultPart) {
        const resultLine = resultPart.toLowerCase().trim();
        
        // Check for correct indicators
        if (resultLine.includes('correct') || 
            resultLine.includes('in favor') || 
            resultLine.includes('לטובת') || 
            resultLine.includes('grounds') || 
            resultLine.includes('עילה') ||
            resultLine.includes('ערעור') ||
            resultLine.includes('should contest') ||
            resultLine.includes('appeal')) {
          console.log("Found 'correct' indicators in result section");
          return 'correct';
        }
        
        // Check for incorrect indicators
        if (resultLine.includes('incorrect') || 
            resultLine.includes('not in favor') || 
            resultLine.includes('valid fine') || 
            resultLine.includes('legitimate') || 
            resultLine.includes('lawful') ||
            resultLine.includes('תקף') ||
            resultLine.includes('חוקי') ||
            resultLine.includes('לא לטובת')) {
          console.log("Found 'incorrect' indicators in result section");
          return 'incorrect';
        }
        
        // Only check for partially if neither correct nor incorrect was found
        if (resultLine.includes('partially') || 
            resultLine.includes('partial') || 
            resultLine.includes('some merit') || 
            resultLine.includes('compromise') ||
            resultLine.includes('חלקית')) {
          console.log("Found 'partially' indicators in result section");
          return 'partially';
        }
        
        // If the section exists but doesn't use standard terms, analyze it further
        let positiveScore = 0;
        let negativeScore = 0;
        
        // Simple word-based scoring as a last resort
        const positiveWords = ['recommend', 'appeal', 'contest', 'grounds', 'argue', 'לערער', 'עילה', 'לטעון'];
        const negativeWords = ['pay', 'valid', 'legitimate', 'properly', 'לשלם', 'תקף', 'חוקי'];
        
        for (const word of positiveWords) {
          if (resultLine.includes(word)) positiveScore++;
        }
        
        for (const word of negativeWords) {
          if (resultLine.includes(word)) negativeScore++;
        }
        
        if (positiveScore > negativeScore) {
          console.log("Result section leans positive based on word analysis");
          return 'correct';
        } else if (negativeScore > positiveScore) {
          console.log("Result section leans negative based on word analysis");
          return 'incorrect';
        }
      }
    }
    
    // Check for favorable indications in both English and Hebrew
    const favorablePatterns = [
      "grounds to contest", 
      "appears to be incorrectly issued",
      "strong case",
      "יש לך עילה", 
      "טעות בדוח",
      "יש בסיס לערעור",
      "לטובתך",
      "יש מקום לבחון את תקפות הקנס",
      "לבטל את הקנס",
      "עילה לערעור",
      "סיכוי גבוה",
      "לערער",
      "valid grounds",
      "strong grounds",
      "good chance",
      "likely to succeed",
      "improperly issued",
      "incorrectly issued",
      "procedural error",
      "technical error",
      "מומלץ לערער",
      "recommend appealing",
      "recommendable to appeal",
      "recommend contesting",
      "overturned",
      "cancelled", "canceled", "refunded", "dismiss", "dismissal", "overruled",
      "incorrect citation", "wrong citation", "error in citation",
      "error in fine", "mistake on ticket", "citation error", "dismiss the fine",
      "recommend contesting", "grounds for dismissal", "grounds to dismiss",
      "grounds to overturn", "technical issue", "factual issue",
      "בסיס לביטול", "ניתן לבטל", "טעות בדו״ח", "טעות ברישום", "ביטול הדוח",
      "כדאי לערער", "סיבה מוצדקת לערעור"
    ];
    
    for (const pattern of favorablePatterns) {
      if (lowerText.includes(pattern.toLowerCase())) {
        console.log(`Found favorable pattern: "${pattern}"`);
        return 'correct';
      }
    }
    
    // Check for unfavorable indications in both English and Hebrew
    const unfavorablePatterns = [
      "appears to be valid",
      "unlikely to succeed",
      "evidence supports the violation",
      "הדוח תקף",
      "אין עילה",
      "הראיות תומכות",
      "סיכוי נמוך",
      "properly issued",
      "valid ticket",
      "legitimate fine",
      "evidence clearly shows",
      "לשלם את הקנס",
      "אין סיבה לערער",
      "no legal basis", 
      "no justification", 
      "no merit", 
      "no valid reason",
      "fine is proper", 
      "fine is correct", 
      "legitimate fine", 
      "valid ticket",
      "pay the fine", 
      "accept the penalty", 
      "accept the fine", 
      "valid citation",
      "evidence confirms", 
      "evidence supports", 
      "evidence validates",
      "אין הצדקה", 
      "אין בסיס", 
      "הדוח תקין", 
      "אין טעות",
      "אין בסיס לערעור", 
      "הראיות תומכות", 
      "ראיות מאששות", 
      "קנס תקף"
    ];
    
    for (const pattern of unfavorablePatterns) {
      if (lowerText.includes(pattern.toLowerCase())) {
        console.log(`Found unfavorable pattern: "${pattern}"`);
        return 'incorrect';
      }
    }
    
    // Check for partially favorable indications - only use these if no clear correct/incorrect indicators found
    const partialPatterns = [
      "partial grounds",
      "some merit",
      "could argue",
      "might have a case",
      "may have grounds",
      "uncertain outcome",
      "mixed evidence",
      "limited options",
      "possible but unlikely",
      "minor issues",
      "reduce the fine",
      "negotiate a settlement",
      "עילה חלקית",
      "אפשרות מסוימת",
      "סיכוי בינוני",
      "יש אפשרות",
      "להפחית את הקנס",
      "ראיות מעורבות",
      "תוצאה לא ודאית",
      "סיכוי מוגבל"
    ];
    
    for (const pattern of partialPatterns) {
      if (lowerText.includes(pattern.toLowerCase())) {
        console.log(`Found partial pattern: "${pattern}"`);
        return 'partially';
      }
    }
    
    // Final check: Does text lean more favorable or unfavorable?
    // Count positive vs negative indicators with weighted scoring
    let positiveScore = 0;
    let negativeScore = 0;
    
    // Words/phrases that indicate positive aspects of the case (grounds for appeal)
    // Format: [word/phrase, weight]
    const positiveWords = [
      // Strong positive indicators (weight 3)
      ["strong grounds", 3], ["clear error", 3], ["definitely contest", 3], ["clear violation", 3],
      ["recommend contesting", 3], ["should contest", 3], ["grounds to appeal", 3], ["successful appeal", 3],
      ["high likelihood", 3], ["עילה חזקה", 3], ["מומלץ לערער", 3], ["סיכוי גבוה", 3], ["טעות ברורה", 3],
      
      // Medium positive indicators (weight 2)
      ["grounds", 2], ["appeal", 2], ["contest", 2], ["error in", 2], ["mistake in", 2], 
      ["may succeed", 2], ["can argue", 2], ["justify contesting", 2], ["valid reason", 2],
      ["עילה", 2], ["ערעור", 2], ["כדאי לערער", 2], ["אפשר לערער", 2], ["לטובתך", 2],
      
      // Weak positive indicators (weight 1)
      ["possible", 1], ["challenge", 1], ["argue", 1], ["consider appealing", 1], ["option to contest", 1],
      ["אפשרי", 1], ["אפשרות", 1], ["לבחון", 1], ["לשקול", 1], ["ניתן לנסות", 1]
    ];
    
    // Words/phrases that indicate negative aspects of the case (unlikely to succeed)
    // Format: [word/phrase, weight]
    const negativeWords = [
      // Strong negative indicators (weight 3)
      ["no grounds", 3], ["clearly valid", 3], ["no basis", 3], ["properly issued", 3], 
      ["correctly issued", 3], ["no error", 3], ["no mistake", 3], ["should pay", 3],
      ["pay the fine", 3], ["will not succeed", 3], ["אין עילה", 3], ["הדוח תקף", 3], 
      ["אין טעות", 3], ["מומלץ לשלם", 3], ["אין סיכוי", 3],
      
      // Medium negative indicators (weight 2)
      ["unlikely", 2], ["valid", 2], ["legitimate", 2], ["lawful", 2], ["properly", 2],
      ["correctly", 2], ["limited chance", 2], ["תקף", 2], ["חוקי", 2], ["כדאי לשלם", 2],
      ["סיכוי נמוך", 2], ["קטן הסיכוי", 2],
      
      // Weak negative indicators (weight 1)
      ["difficult", 1], ["challenging", 1], ["תשלום", 1], ["קשה", 1], ["מאתגר", 1]
    ];
    
    // Expanded list of neutral contexts to ignore
    const neutralContexts = [
      // Officer information contexts
      ["officer", "name"], ["officer", "badge"], ["badge", "number"], ["missing", "information"],
      ["details", "missing"], ["השוטר", "שם"], ["השוטר", "פרטי"], ["תג", "מספר"], ["חסרים", "פרטים"],
      
      // Administrative details
      ["fine", "number"], ["date", "issue"], ["מספר", "דוח"], ["תאריך", "הנפקה"],
      
      // Procedural references that don't impact the result
      ["appeal process", "procedure"], ["הגשת ערעור", "תהליך"]
    ];
    
    // Process the text sentence by sentence for more accurate context analysis
    const sentences = lowerText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      const sentenceLower = sentence.toLowerCase();
      
      // Skip neutral context sentences
      let isNeutralContext = false;
      for (const [term1, term2] of neutralContexts) {
        if (sentenceLower.includes(term1) && sentenceLower.includes(term2)) {
          isNeutralContext = true;
          break;
        }
      }
      if (isNeutralContext) continue;
      
      // Calculate positive score for this sentence
      for (const [term, weight] of positiveWords) {
        if (sentenceLower.includes(term.toLowerCase())) {
          // Apply context-sensitive modifiers
          let modifier = 1.0;
          
          // Check for negations that would flip the meaning
          if (sentenceLower.match(/\b(not|no|isn't|don't|wouldn't|couldn't|won't|can't|never|אין|לא|אינו|אל)\b/)) {
            modifier = -0.5; // Flip and reduce impact - negative negation isn't as strong a signal
          }
          
          // Check for qualifiers that reduce certainty
          if (sentenceLower.match(/\b(may|might|perhaps|possibly|sometimes|אולי|יתכן|לפעמים)\b/)) {
            modifier *= 0.7; // Reduce impact by 30%
          }
          
          positiveScore += weight * modifier;
          break; // Count only the strongest term in this sentence
        }
      }
      
      // Calculate negative score for this sentence
      for (const [term, weight] of negativeWords) {
        if (sentenceLower.includes(term.toLowerCase())) {
          // Apply context-sensitive modifiers
          let modifier = 1.0;
          
          // Check for negations that would flip the meaning
          if (sentenceLower.match(/\b(not|no|isn't|don't|wouldn't|couldn't|won't|can't|never|אין|לא|אינו|אל)\b/) &&
              !term.includes("no ") && !term.includes("not ") && !term.includes("אין ")) { // Skip if the term itself includes negation
            modifier = -0.5; // Flip and reduce impact
          }
          
          // Check for qualifiers that reduce certainty
          if (sentenceLower.match(/\b(may|might|perhaps|possibly|sometimes|אולי|יתכן|לפעמים)\b/)) {
            modifier *= 0.7; // Reduce impact by 30%
          }
          
          negativeScore += weight * modifier;
          break; // Count only the strongest term in this sentence
        }
      }
    }
    
    console.log(`Weighted sentiment analysis - Positive: ${positiveScore.toFixed(1)}, Negative: ${negativeScore.toFixed(1)}`);
    
    // Determine result based on weighted scores with thresholds
    const scoreDifference = positiveScore - negativeScore;
    const absoluteDifference = Math.abs(scoreDifference);
    
    // Strong clear signals (higher threshold)
    if (scoreDifference > 3) {
      console.log("Text sentiment strongly positive - marking as 'correct'");
      return 'correct';
    } else if (scoreDifference < -3) {
      console.log("Text sentiment strongly negative - marking as 'incorrect'");
      return 'incorrect';
    } 
    // Moderate signals
    else if (scoreDifference > 1.5) {
      console.log("Text sentiment moderately positive - marking as 'correct'");
      return 'correct';
    } else if (scoreDifference < -1.5) {
      console.log("Text sentiment moderately negative - marking as 'incorrect'");
      return 'incorrect';
    }
    // Weak signals or mixed signals - partially in your favor
    else {
      console.log("Text sentiment mixed or unclear - marking as 'partially'");
      return 'partially';
    }
  };
  
  // Helper function to extract recommendation from the summary
  const extractRecommendationFromSummary = (summary) => {
    // If no summary, return empty string
    if (!summary) return "";
    
    try {
      // Look for recommendation section with different patterns in both Hebrew and English
      
      // Hebrew patterns
      if (summary.includes("### המלצה") || summary.includes("המלצה:")) {
        console.log("Found Hebrew recommendation section");
        let recommendationSection = "";
        
        if (summary.includes("### המלצה")) {
          recommendationSection = summary.split("### המלצה")[1]?.split("###")[0] || "";
        } else if (summary.includes("המלצה:")) {
          recommendationSection = summary.split("המלצה:")[1]?.split(/\n\n|\r\n\r\n|### תוצאה|תוצאה:/)[0] || "";
        }
        
        if (!recommendationSection.trim()) return "";
        
        // Process the recommendation - take up to 2 paragraphs to get complete recommendation
        const paragraphs = recommendationSection.trim().split(/\n\n|\r\n\r\n/).filter(p => p.trim());
        
        if (paragraphs.length > 0) {
          // Check if it's a very short paragraph and combine with the next if available
          if (paragraphs[0].length < 50 && paragraphs.length > 1) {
            return paragraphs[0].trim() + " " + paragraphs[1].trim();
          }
          return paragraphs[0].trim();
        }
        
        // If paragraphs extraction didn't work, take the whole section
        let cleanedRecommendation = recommendationSection.trim()
          .replace(/^[\s\n]*|[\s\n]*$/g, '') // Trim whitespace and newlines
          .replace(/\n+/g, ' '); // Replace multiple newlines with spaces for cleaner text
          
        return cleanedRecommendation || "";
      }
      
      // English patterns
      if (summary.includes("### Recommendation") || summary.includes("Recommendation:") || 
          summary.includes("RECOMMENDATION:") || summary.includes("### RECOMMENDATION")) {
        console.log("Found English recommendation section");
        let recommendationSection = "";
        
        if (summary.includes("### Recommendation")) {
          recommendationSection = summary.split("### Recommendation")[1]?.split("###")[0] || "";
        } else if (summary.includes("### RECOMMENDATION")) {
          recommendationSection = summary.split("### RECOMMENDATION")[1]?.split("###")[0] || "";
        } else if (summary.includes("Recommendation:")) {
          recommendationSection = summary.split("Recommendation:")[1]?.split(/\n\n|\r\n\r\n|### Result|Result:/)[0] || "";
        } else if (summary.includes("RECOMMENDATION:")) {
          recommendationSection = summary.split("RECOMMENDATION:")[1]?.split(/\n\n|\r\n\r\n|### RESULT|RESULT:/)[0] || "";
        }
        
        if (!recommendationSection.trim()) {
          // Try with line-by-line search if section extraction failed
          const lines = summary.split("\n");
          let recommendationText = "";
          let inRecommendation = false;
          
          for (const line of lines) {
            // Check for recommendation section marker
            if (line.match(/recommendation:?|המלצה:?/i)) {
              inRecommendation = true;
              // If the recommendation is on the same line as the heading
              const colonIndex = line.indexOf(":");
              if (colonIndex > -1) {
                recommendationText = line.substring(colonIndex + 1).trim();
              }
              continue;
            }
            
            if (inRecommendation) {
              // If this line is the start of a new section, stop
              if (line.match(/^###|result:?|תוצאה:?/i)) {
                break;
              }
              
              // Add non-empty lines to the recommendation text
              if (line.trim()) {
                recommendationText += (recommendationText ? " " : "") + line.trim();
              } else if (recommendationText) {
                // Empty line after we have content - consider it the end of the section
                break;
              }
            }
          }
          
          return recommendationText || "";
        }
        
        // Process the recommendation section if found
        const paragraphs = recommendationSection.trim().split(/\n\n|\r\n\r\n/).filter(p => p.trim());
        
        if (paragraphs.length > 0) {
          // Check if it's a very short paragraph and combine with the next if available
          if (paragraphs[0].length < 50 && paragraphs.length > 1) {
            return paragraphs[0].trim() + " " + paragraphs[1].trim();
          }
          return paragraphs[0].trim();
        }
        
        // If paragraphs extraction didn't work, take the whole section
        let cleanedRecommendation = recommendationSection.trim()
          .replace(/^[\s\n]*|[\s\n]*$/g, '') // Trim whitespace and newlines
          .replace(/\n+/g, ' '); // Replace multiple newlines with spaces for cleaner text
          
        return cleanedRecommendation || "";
      }
      
      // If no recommendation section was found explicitly, try to extract from the end of the summary
      // Many summaries end with a recommendation even if not explicitly labeled
      const lines = summary.split("\n");
      const lastFewLines = lines.slice(-3).join(" ").trim();
      
      if (lastFewLines.match(/recommend|suggestion|advised|המלצה|מומלץ|כדאי/i)) {
        // This appears to be a recommendation
        return lastFewLines;
      }
      
      return "";
    } catch (err) {
      console.error("Error extracting recommendation from summary:", err);
      return "";
    }
  };

  // Helper function to extract key points from summary if keyPoints array is empty
  const extractKeyPointsFromSummary = (summary) => {
    // If no summary, return empty array
    if (!summary) return [];
    
    // Apply RTL text fixes for Hebrew content after extraction
    const cleanHebrewText = (text) => {
      if (!isRTL) return text;
      return text
        .replace(/^(.):\s*/gm, '$1') // Fix colon after first letter
        .replace(/\*/g, '')          // Remove asterisks
        .trim();
    };
    
    try {
      // Look for Hebrew key points section patterns
      if (summary.includes("### נקודות מפתח") || summary.includes("נקודות מפתח:") || 
          summary.includes("### Key Points") || summary.includes("Key Points:")) {
        
        console.log("Found key points section");
        
        // Extract the relevant section based on the marker found
        let keyPointsSection = "";
        if (summary.includes("### נקודות מפתח")) {
          keyPointsSection = summary.split("### נקודות מפתח")[1]?.split("###")[0] || "";
        } else if (summary.includes("נקודות מפתח:")) {
          keyPointsSection = summary.split("נקודות מפתח:")[1]?.split(/\n\n|\r\n\r\n|המלצה:|### המלצה/)[0] || "";
        } else if (summary.includes("### Key Points")) {
          keyPointsSection = summary.split("### Key Points")[1]?.split("###")[0] || "";
        } else if (summary.includes("Key Points:")) {
          keyPointsSection = summary.split("Key Points:")[1]?.split(/\n\n|\r\n\r\n|Recommendation:|### Recommendation/)[0] || "";
        }
        
        if (!keyPointsSection.trim()) return [];
        
        // Try multiple patterns for extracting points
        // 1. Look for numbered points with possible bold markers
        const regex1 = /\d+\.\s*(?:\*\*)?(.+?)(?:\*\*)?:?\s*(.+?)(?=\n\d+\.|\n\n|$)/gs;
        const matches1 = [...keyPointsSection.matchAll(regex1)];
        
        if (matches1.length > 0) {
          const keyPointsArray = [];
          matches1.forEach(match => {
            const label = match[1]?.trim();
            const content = match[2]?.trim();
            
            if (label && content) {
              keyPointsArray.push(`${label}: ${content}`);
            } else if (label) {
              keyPointsArray.push(label);
            }
          });
          
          if (keyPointsArray.length > 0) {
            console.log(`Extracted ${keyPointsArray.length} key points using pattern 1`);
            return keyPointsArray;
          }
        }
        
        // 2. Try simpler pattern - just lines starting with numbers or bullets
        const lines = keyPointsSection.split("\n");
        const keyPointsArray = [];
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          // Match numbered points or bullet points
          if (trimmedLine.match(/^(\d+\.|•|-|\*)\s+/)) {
            const cleanLine = trimmedLine
              .replace(/^(\d+\.|•|-|\*)\s+/, '')  // Remove bullet/number
              .replace(/^\*\*|\*\*$/g, '')       // Remove bold markers
              .trim();
              
            if (cleanLine) {
              keyPointsArray.push(cleanHebrewText(cleanLine));
            }
          }
        }
        
        if (keyPointsArray.length > 0) {
          console.log(`Extracted ${keyPointsArray.length} key points using pattern 2`);
          return keyPointsArray;
        }
      }
      
      // If no structured section was found, try to look for numbered or bulleted lists anywhere in the text
      const lines = summary.split("\n");
      const keyPointsArray = [];
      let inList = false;
      let listIndent = 0;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        const leadingSpaces = line.search(/\S/);
        
        // Detect list items (numbered, dash, bullet)
        if (trimmedLine.match(/^(\d+\.|•|-|\*)\s+/)) {
          // Check if this is a new list or continuing an existing one
          if (!inList || leadingSpaces <= listIndent) {
            inList = true;
            listIndent = leadingSpaces;
          }
          
          const cleanLine = trimmedLine
            .replace(/^(\d+\.|•|-|\*)\s+/, '')
            .replace(/^\*\*|\*\*$/g, '')
            .trim();
            
          if (cleanLine) {
            keyPointsArray.push(cleanHebrewText(cleanLine));
          }
        } 
        // End list detection on empty lines or if indentation level decreases
        else if (inList && (trimmedLine === '' || (leadingSpaces < listIndent && leadingSpaces >= 0))) {
          inList = false;
        }
      }
      
      if (keyPointsArray.length > 0) {
        console.log(`Extracted ${keyPointsArray.length} key points from general text parsing`);
        return keyPointsArray;
      }
      
      return [];
    } catch (err) {
      console.error("Error extracting key points from summary:", err);
      return [];
    }
  };

  // Fetch or use existing analysis
  useEffect(() => {
    async function getAnalysis() {
      try {
        // If we already have an analysis from params, use it
        if (analysisParam) {
          console.log("Using analysis from params:", analysisParam);
          try {
            const parsedAnalysis = JSON.parse(analysisParam);
            console.log("Parsed analysis:", parsedAnalysis);
            
            // Try to detect result from text with our improved detection function
            const detectedResult = detectResultFromText(parsedAnalysis.summary);
            console.log("Detected result from parsedAnalysis:", detectedResult);
            
            // Always override the result with what we detect from text analysis
            // This is more reliable than the API's result field
            if (detectedResult) {
              parsedAnalysis.result = detectedResult;
              console.log("Overriding parsedAnalysis.result with detected result:", detectedResult);
            }
            
            // Make sure we have a valid result value (favor the original result from API to maintain consistency)
            const resultToUse = parsedAnalysis.result || detectedResult || "partially";
            console.log("Final determined result:", resultToUse);
            
            // Check if keyPoints is empty and try to extract from summary
            if ((!parsedAnalysis.keyPoints || parsedAnalysis.keyPoints.length === 0) && parsedAnalysis.summary) {
              console.log("Extracting key points from summary");
              const extractedKeyPoints = extractKeyPointsFromSummary(parsedAnalysis.summary);
              if (extractedKeyPoints.length > 0) {
                parsedAnalysis.keyPoints = extractedKeyPoints;
                console.log("Extracted key points:", extractedKeyPoints);
              }
            }
            
            // Check if recommendation is the default placeholder and try to extract from summary
            if ((!parsedAnalysis.recommendation || 
                parsedAnalysis.recommendation === "Please review the details of your fine.") && 
                parsedAnalysis.summary) {
              console.log("Extracting recommendation from summary");
              const extractedRecommendation = extractRecommendationFromSummary(parsedAnalysis.summary);
              if (extractedRecommendation) {
                parsedAnalysis.recommendation = extractedRecommendation;
                console.log("Extracted recommendation:", extractedRecommendation);
              }
            }
            
            console.log("Analysis result (detected/provided):", detectedResult || parsedAnalysis.result);
            setAnalysis(parsedAnalysis);
            setAnalysisResult(resultToUse);
            setIsAnalyzing(false);
            return;
          } catch (error) {
            console.error("Error parsing analysis param:", error);
          }
        }
        
        // If the fine already has an analysis in Redux store, use it
        if (currentFine?.analysis) {
          console.log("Using analysis from Redux store");
          
          // Try to detect result from text with our improved detection function
          const detectedResult = detectResultFromText(currentFine.analysis.summary);
          console.log("Detected result from currentFine:", detectedResult);
          
          // Clone the analysis to avoid modifying Redux state directly
          const analysisClone = {...currentFine.analysis};
          
          // If we detected a specific result from the text, prefer that over the stored value
          if (detectedResult) {
            analysisClone.result = detectedResult;
            console.log("Overriding analysisClone.result with detected result:", detectedResult);
          }
          
          // Make sure we have a valid result value (favor the original result to match what's shown in fines list)
          const resultToUse = currentFine.analysis.result || detectedResult || "partially";
          console.log("Final determined result:", resultToUse);
          
          // Check if keyPoints is empty and try to extract from summary
          if ((!analysisClone.keyPoints || analysisClone.keyPoints.length === 0) && analysisClone.summary) {
            console.log("Extracting key points from summary");
            const extractedKeyPoints = extractKeyPointsFromSummary(analysisClone.summary);
            if (extractedKeyPoints.length > 0) {
              analysisClone.keyPoints = extractedKeyPoints;
              console.log("Extracted key points:", extractedKeyPoints);
            }
          }
          
          // Check if recommendation is the default placeholder and try to extract from summary
          if ((!analysisClone.recommendation || 
              analysisClone.recommendation === "Please review the details of your fine.") && 
              analysisClone.summary) {
            console.log("Extracting recommendation from summary");
            const extractedRecommendation = extractRecommendationFromSummary(analysisClone.summary);
            if (extractedRecommendation) {
              analysisClone.recommendation = extractedRecommendation;
              console.log("Extracted recommendation:", extractedRecommendation);
            }
          }
          
          setAnalysis(analysisClone);
          setAnalysisResult(resultToUse);
          setIsAnalyzing(false);
          return;
        }
        
        // If we need to fetch the analysis
        if (fineId && currentFineReport) {
          setIsAnalyzing(true);
          
          // Dispatch the async thunk to analyze the fine
          const resultAction = await dispatch(analyzeFine(currentFineReport));
          
          if (analyzeFine.fulfilled.match(resultAction)) {
            const analysisData = resultAction.payload.analysis;
            
            // Try to detect result from text with our improved detection function
            const detectedResult = detectResultFromText(analysisData.summary);
            console.log("Detected result from API analysisData:", detectedResult);
            
            // Always override the result with what we detect from text analysis
            // This is more reliable than the API's result field
            if (detectedResult) {
              analysisData.result = detectedResult;
              console.log("Overriding API analysisData.result with detected result:", detectedResult);
            }
            
            // Make sure we have a valid result value (favor the original result from API to maintain consistency)
            const resultToUse = analysisData.result || detectedResult || "partially";
            console.log("Final determined result:", resultToUse);
            
            // Check if keyPoints is empty and try to extract from summary
            if ((!analysisData.keyPoints || analysisData.keyPoints.length === 0) && analysisData.summary) {
              console.log("Extracting key points from summary");
              const extractedKeyPoints = extractKeyPointsFromSummary(analysisData.summary);
              if (extractedKeyPoints.length > 0) {
                analysisData.keyPoints = extractedKeyPoints;
                console.log("Extracted key points:", extractedKeyPoints);
              }
            }
            
            // Check if recommendation is the default placeholder and try to extract from summary
            if ((!analysisData.recommendation || 
                analysisData.recommendation === "Please review the details of your fine.") && 
                analysisData.summary) {
              console.log("Extracting recommendation from summary");
              const extractedRecommendation = extractRecommendationFromSummary(analysisData.summary);
              if (extractedRecommendation) {
                analysisData.recommendation = extractedRecommendation;
                console.log("Extracted recommendation:", extractedRecommendation);
              }
            }
            
            setAnalysis(analysisData);
            setAnalysisResult(resultToUse);
          } else {
            throw new Error('Failed to analyze fine');
          }
        }
      } catch (err) {
        console.error('Error analyzing fine:', err);
        
        // If we have a UI error state, set it
        setIsAnalyzing(false);
      }
    }
    
    getAnalysis();
  }, [fineId, currentFine, analysisParam, dispatch]);

  const renderResultContent = () => {
    console.log("Rendering result content with analysis:", analysis);
    console.log("Analysis result:", analysisResult);
    
    if (!analysis) {
      console.log("No analysis available, returning null");
      return null;
    }
    
    // Always force a new text analysis on the summary to ensure we get the most accurate result
    let forcedDetectedResult = 'partially'; // Default to 'partially' if we can't detect anything
    
    if (analysis.summary) {
      // Try to force detect a result directly from the summary text
      const detectedResult = detectResultFromText(analysis.summary);
      if (detectedResult) {
        forcedDetectedResult = detectedResult;
      }
      console.log("Forced detection from summary:", forcedDetectedResult);
    }
    
    console.log("Result hierarchy check:");
    console.log("- analysisResult from state:", analysisResult);
    console.log("- forcedDetectedResult from text:", forcedDetectedResult);
    console.log("- analysis.result from API:", analysis.result);
    
    // For debugging - log the entire summary
    console.log("Summary text for analysis:", analysis.summary?.substring(0, 100) + "...");
    
    // Prioritize results in the following order to match what's displayed in fines list:
    // 1. Result from the API response/stored analysis (original result in fines list)
    // 2. Result stored in analysisResult state (previously detected)
    // 3. Explicitly detected result from current text analysis
    // 4. Fall back to 'partially' only as last resort
    let resultToUse;
    
    // First priority: Use the original result from analysis object to maintain consistency with fines list
    if (analysis.result) {
      resultToUse = analysis.result;
      console.log("Using analysis.result to match fines list:", resultToUse);
    }
    // Second priority: Use the stored analysisResult state
    else if (analysisResult) {
      resultToUse = analysisResult;
      console.log("Using analysisResult from state:", resultToUse);
    }
    // Third priority: Use the newly detected result
    else if (forcedDetectedResult) {
      resultToUse = forcedDetectedResult;
      console.log("Using forcedDetectedResult as fallback:", resultToUse);
    }
    // Last resort
    else {
      resultToUse = "partially";
      console.log("Using 'partially' as default fallback");
    }
    console.log("Using result:", resultToUse);
    
    // Get the analysis title and color based on the result
    let analysisTitle = "";
    let titleColor = null;
    
    // Set the title dynamically based on the result
    if (resultToUse === 'correct') {
      analysisTitle = t('inYourFavor');
      titleColor = COLORS.success;
    } else if (resultToUse === 'partially') {
      analysisTitle = t('partiallyFavor');
      titleColor = COLORS.warning;
    } else if (resultToUse === 'incorrect') {
      analysisTitle = t('notInFavor');
      titleColor = COLORS.error;
    }
    
    // Log key values for debugging the final result determination
    console.log("Current analysisResult value:", analysisResult);
    console.log("Raw analysis.result value:", analysis.result);
    console.log("Final result to use:", resultToUse);
    
    switch(resultToUse) {
      case 'correct':
        return (
          <Card style={styles.resultCard}>
            <Text style={[
              styles.resultTitle, 
              { color: titleColor,
                textAlign: isRTL ? 'right' : 'left' 
              }
            ]}>{analysisTitle}</Text>
            <Text style={[
              styles.resultText,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('inYourFavorDesc')}
            </Text>
            <Text style={[
              styles.noteText,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('notification')}
            </Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.nextStepsButton}
              onPress={() => handleNextSteps('correct')}
            >
              <Text style={styles.nextStepsButtonText}>{t('nextSteps')}</Text>
            </TouchableOpacity>
          </Card>
        );
      case 'partially':
        return (
          <Card style={styles.resultCard}>
            <Text style={[
              styles.resultTitle, 
              { color: titleColor,
                textAlign: isRTL ? 'right' : 'left' 
              }
            ]}>{analysisTitle}</Text>
            <Text style={[
              styles.resultText,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('partiallyFavorDesc')}
            </Text>
            <Text style={[
              styles.resultText,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {analysis.recommendation || t('compromise')}
            </Text>
            <TouchableOpacity 
              activeOpacity={0.7}
              style={styles.nextStepsButton}
              onPress={() => handleNextSteps('partially')}
            >
              <Text style={styles.nextStepsButtonText}>{t('nextSteps')}</Text>
            </TouchableOpacity>
          </Card>
        );
      case 'incorrect':
        return (
          <Card style={styles.resultCard}>
            <Text style={[
              styles.resultTitle, 
              { color: titleColor,
                textAlign: isRTL ? 'right' : 'left' 
              }
            ]}>{analysisTitle}</Text>
            <Text style={[
              styles.resultText,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('notInFavorDesc')}
            </Text>
            <Text style={[
              styles.resultText,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('additionalInfo')}
            </Text>
            <View style={[
              styles.buttonRow,
              { flexDirection: isRTL ? 'row-reverse' : 'row' }
            ]}>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.nextStepsButton, styles.primaryButton]}
                onPress={handleAdditionalInfo}
              >
                <Text style={styles.primaryButtonText}>{t('addInfo')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.nextStepsButton, styles.outlineButton]}
                onPress={() => handleNextSteps('incorrect')}
              >
                <Text style={styles.outlineButtonText}>{t('noContinue')}</Text>
              </TouchableOpacity>
            </View>
          </Card>
        );
      default:
        return null;
    }
  };

  // Reference to scroll view
  const scrollViewRef = useRef(null);
  
  // Function to handle button press with explicit navigation
  const handleNextSteps = (result) => {
    // Small delay to prevent scroll position reset issues
    setTimeout(() => {
      router.push({
        pathname: '/options',
        params: { result, fineId: currentFineReport.reportNumber }
      });
    }, 50);
  };
  
  // Function to handle additional info button
  const handleAdditionalInfo = () => {
    // Small delay to prevent scroll position reset issues
    setTimeout(() => {
      router.push('/additional-info');
    }, 50);
  };
  
  // Helper function to fix RTL text issues (colons after first letter, asterisks)
  const fixRTLText = (text) => {
    if (!text || !isRTL) return text;
    return text
      .replace(/^(.):\s*/gm, '$1') // Fix colon after first letter
      .replace(/\*/g, '')          // Remove asterisks
      .trim();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.scrollContainer
        ]}
        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <View style={styles.titleContainer}>
          <Text style={[
            styles.title,
            { textAlign: isRTL ? 'right' : 'left' }
          ]}>
            {t('fineReportSummary')}
          </Text>
        </View>
        
        {showNewFineMessage && (
          <View style={styles.successMessage}>
            <Text style={[
              styles.successText,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('fineSubmitted')}
            </Text>
          </View>
        )}
        
        <Card>
          <View style={[
            styles.reportHeader,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <Text style={[
              styles.reportTitle,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('fineReport')} #{currentFineReport.reportNumber}
            </Text>
            <TouchableOpacity
              style={styles.viewFullButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={[
                styles.viewFullText,
                { textAlign: isRTL ? 'right' : 'left' }
              ]}>
                {t('fullReport')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[
            styles.reportItem,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <Text style={[
              styles.reportLabel,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('date')}
            </Text>
            <Text style={[
              styles.reportValue,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {currentFineReport.date}
            </Text>
          </View>
          
          <View style={[
            styles.reportItem,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <Text style={[
              styles.reportLabel,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('violation')}
            </Text>
            <Text style={[
              styles.reportValue,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {currentFineReport.violation}
            </Text>
          </View>
          
          <View style={[
            styles.reportItem,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <Text style={[
              styles.reportLabel,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('amount')}
            </Text>
            <Text style={[
              styles.reportValue,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {currentFineReport.amount}
            </Text>
          </View>
          
          <View style={[
            styles.reportItem,
            { flexDirection: isRTL ? 'row-reverse' : 'row' }
          ]}>
            <Text style={[
              styles.reportLabel,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {t('dueDate')}
            </Text>
            <Text style={[
              styles.reportValue,
              { textAlign: isRTL ? 'right' : 'left' }
            ]}>
              {currentFineReport.dueDate}
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={[
            styles.sectionTitle,
            { 
              textAlign: isRTL ? 'right' : 'left',
              marginHorizontal: SIZES.medium,
              marginBottom: SIZES.medium
            }
          ]}>
            {t('analysis')}
          </Text>
          
          {isAnalyzing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={[
                styles.loadingText,
                { textAlign: 'center' } // Keep centered for both LTR/RTL
              ]}>
                {t('analyzingFine')}
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={[
                styles.errorText,
                { textAlign: isRTL ? 'right' : 'left' }
              ]}>
                {error}
              </Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.nextStepsButton, styles.outlineButton, {width: '100%'}]}
                onPress={() => {
                  setIsAnalyzing(true);
                  // Trigger the useEffect again by setting a dummy state
                  setError(null);
                }}
              >
                <Text style={styles.outlineButtonText}>{t('retryAnalysis')}</Text>
              </TouchableOpacity>
            </View>
          ) : analysis ? (
            <>
              {console.log("Rendering analysis section with:", analysis)}
              <View style={{ 
                paddingHorizontal: SIZES.medium,
                marginBottom: SIZES.medium,
                alignSelf: 'stretch',
                alignItems: isRTL ? 'flex-end' : 'flex-start'
              }}>
                <Text style={[
                  styles.analysisText,
                  { 
                    textAlign: isRTL ? 'right' : 'left',
                    writingDirection: isRTL ? 'rtl' : 'ltr',
                    width: '100%'
                  }
                ]}>
                  {/* Show a summary without duplicating key points */}
                  {(() => {
                    // If the summary contains structured sections, only show the summary part
                    if (analysis.summary && analysis.summary.includes('###')) {
                      // For Hebrew, extract just the summary section
                      if (isRTL && analysis.summary.includes('### סיכום')) {
                        const summarySection = analysis.summary.split('### סיכום')[1]?.split('###')[0]?.trim();
                        return fixRTLText(summarySection) || t('noAnalysisText');
                      }
                      
                      // For English, extract just the summary part
                      if (!isRTL && analysis.summary.includes('Summary')) {
                        const lines = analysis.summary.split('\n');
                        let summaryText = '';
                        let inSummarySection = false;
                        
                        for (const line of lines) {
                          if (line.includes('Summary') || line.includes('SUMMARY')) {
                            inSummarySection = true;
                            // If the summary title has content after it
                            const colonIndex = line.indexOf(':');
                            if (colonIndex > -1) {
                              summaryText += line.substring(colonIndex + 1).trim() + ' ';
                            }
                            continue;
                          }
                          
                          if (inSummarySection && !line.includes('###') && line.trim()) {
                            summaryText += line.trim() + ' ';
                          } else if (inSummarySection && line.includes('###')) {
                            break;
                          }
                        }
                        
                        return summaryText.trim() || t('noAnalysisText');
                      }
                    }
                    
                    // If no structured format, return the full summary with RTL fixes for Hebrew
                    return isRTL ? fixRTLText(analysis.summary) : (analysis.summary || t('noAnalysisText'));
                  })()}
                </Text>
              </View>
              
              <Text style={[
                styles.subTitle,
                { 
                  textAlign: isRTL ? 'right' : 'left',
                  marginHorizontal: SIZES.medium,
                  marginTop: SIZES.small
                }
              ]}>
                {t('keyPoints')}:
              </Text>
              
              <View style={{ 
                paddingHorizontal: SIZES.medium, 
                marginTop: SIZES.small,
                marginBottom: SIZES.medium,
                alignItems: isRTL ? 'flex-end' : 'flex-start',
                alignSelf: 'stretch'
              }}>
                {/* Display key points */}
                {analysis.keyPoints && analysis.keyPoints.length > 0 ? (
                  analysis.keyPoints.map((point, index) => (
                    <View key={index} style={{
                      flexDirection: isRTL ? 'row-reverse' : 'row',
                      alignItems: 'flex-start',
                      marginBottom: SIZES.small,
                      paddingRight: isRTL ? 0 : SIZES.small,
                      paddingLeft: isRTL ? SIZES.small : 0,
                      width: '100%'
                    }}>
                      <Text style={{ 
                        marginTop: isRTL ? 6 : 2,
                        marginHorizontal: 4,
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr'
                      }}>•</Text>
                      <Text style={[
                        styles.bulletPoint,
                        { 
                          textAlign: isRTL ? 'right' : 'left',
                          writingDirection: isRTL ? 'rtl' : 'ltr',
                          flex: 1,
                          marginTop: 0,
                          marginBottom: 0
                        }
                      ]}>
                        {fixRTLText(point)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={{
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                    alignItems: isRTL ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}>
                    <Text style={{ 
                      marginTop: isRTL ? 6 : 2,
                      marginHorizontal: 4,
                      textAlign: isRTL ? 'right' : 'left',
                      writingDirection: isRTL ? 'rtl' : 'ltr'
                    }}>•</Text>
                    <Text style={[
                      styles.bulletPoint,
                      { 
                        textAlign: isRTL ? 'right' : 'left',
                        writingDirection: isRTL ? 'rtl' : 'ltr',
                        flex: 1
                      }
                    ]}>
                      {t('noKeyPoints')}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={[
                styles.subTitle,
                { 
                  textAlign: isRTL ? 'right' : 'left',
                  marginHorizontal: SIZES.medium,
                  marginTop: SIZES.small
                }
              ]}>
                {t('recommendation')}:
              </Text>
              
              <View style={{ 
                paddingHorizontal: SIZES.medium,
                marginBottom: SIZES.medium,
                alignSelf: 'stretch',
                alignItems: isRTL ? 'flex-end' : 'flex-start'
              }}>
                <Text style={[
                  styles.analysisText,
                  { 
                    textAlign: isRTL ? 'right' : 'left',
                    writingDirection: isRTL ? 'rtl' : 'ltr',
                    width: '100%'
                  }
                ]}>
                  {fixRTLText(analysis.recommendation) || t('defaultRecommendation')}
                </Text>
              </View>
              
              <TouchableOpacity style={[
                styles.legalButton,
                { 
                  alignSelf: isRTL ? 'flex-end' : 'flex-start',
                  marginHorizontal: SIZES.medium,
                  marginTop: SIZES.small
                }
              ]}>
                <Text style={[
                  styles.legalButtonText,
                  { 
                    textAlign: isRTL ? 'right' : 'left',
                    writingDirection: isRTL ? 'rtl' : 'ltr'
                  }
                ]}>
                  {t('legalRules')}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noAnalysisContainer}>
              <Text style={[
                styles.noAnalysisText,
                { textAlign: isRTL ? 'right' : 'left' }
              ]}>
                {t('noAnalysis')}
              </Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.nextStepsButton, styles.primaryButton, {width: '100%'}]}
                onPress={() => {
                  setIsAnalyzing(true);
                  // Trigger the useEffect again
                  setError(null);
                }}
              >
                <Text style={styles.primaryButtonText}>{t('generateAnalysis')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {!isAnalyzing && !error && analysis ? (
          <>
            <Text style={[
              styles.sectionTitle,
              { 
                textAlign: 'center',
                marginHorizontal: SIZES.medium,
                marginBottom: SIZES.medium,
                alignSelf: 'center'
              }
            ]}>{t('preliminaryConclusion')}</Text>
            {console.log("About to render conclusion with analysis:", analysis)}
            {console.log("Analysis result before set:", analysis?.result)}
            {console.log("Analysis summary excerpt:", analysis?.summary?.substring(0, 150) + "...")}
            
            {/* Force a recheck of the result from text */}
            {(() => {
              if (analysis.summary) {
                const redetectedResult = detectResultFromText(analysis.summary);
                console.log("RECHECK - Detected result directly from summary:", redetectedResult);
                
                if (redetectedResult && (redetectedResult === 'correct' || redetectedResult === 'incorrect')) {
                  // If we get a definitive result, override the analysisResult
                  console.log("IMPORTANT - Forcing override with redetected result:", redetectedResult);
                  if (analysisResult !== redetectedResult) {
                    setAnalysisResult(redetectedResult);
                  }
                }
              }
              return null;
            })()}
            
            {/* Ensure we have an analysisResult */}
            {analysis && (!analysisResult || analysisResult === '') && setAnalysisResult(analysis.result || 'partially')}
            {renderResultContent()}
          </>
        ) : (
          console.log("Not showing conclusion section. isAnalyzing:", isAnalyzing, "error:", error, "analysis:", analysis, "analysisResult:", analysisResult)
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('fullFineReport')}</Text>
              
              <ScrollView 
                style={styles.modalScrollView} 
                contentContainerStyle={styles.modalScrollContent}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {Object.entries(currentFineReport).map(([key, value]) => {
                  // Skip the analysis object and other non-string fields
                  if (key === 'analysis' || typeof value === 'object') {
                    return null;
                  }
                  
                  // Translate common field names if possible
                  let fieldLabel = key;
                  const translationKey = key.toLowerCase();
                  
                  // Try to use translation keys for common fields
                  if (translationKey === 'date' || 
                      translationKey === 'amount' || 
                      translationKey === 'violation' || 
                      translationKey === 'location' || 
                      translationKey === 'duedate' || 
                      translationKey === 'officer' || 
                      translationKey === 'badge') {
                    fieldLabel = t(translationKey) || key;
                  } else {
                    // Format the key properly if no translation is available
                    fieldLabel = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                  }
                  
                  return (
                    <View key={key} style={[
                      styles.modalItem,
                      { flexDirection: isRTL ? 'row-reverse' : 'row' }
                    ]}>
                      <Text style={[
                        styles.modalLabel,
                        { textAlign: isRTL ? 'right' : 'left' }
                      ]}>{fieldLabel}</Text>
                      <Text style={[
                        styles.modalValue,
                        { textAlign: isRTL ? 'right' : 'left' }
                      ]}>{String(value)}</Text>
                    </View>
                  );
                })}
              </ScrollView>
              
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.nextStepsButton, styles.primaryButton, {width: '100%', marginTop: SIZES.large}]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.primaryButtonText}>{t('close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: SIZES.medium,
    
  },
  titleContainer: {
    marginBottom: SIZES.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...FONTS.bold,
    fontSize: SIZES.extraLarge,
    color: COLORS.primary,
    textAlign: 'center',
  },
  successMessage: {
    backgroundColor: COLORS.success + '20', // 20% opacity
    borderWidth: 1,
    borderColor: COLORS.success,
    borderRadius: SIZES.base,
    padding: SIZES.small,
    marginBottom: SIZES.medium,
  },
  successText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.success,
    textAlign: 'center',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  reportTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.primary,
  },
  viewFullButton: {
    padding: SIZES.base,
  },
  viewFullText: {
    ...FONTS.medium,
    fontSize: SIZES.small,
    color: COLORS.secondary,
  },
  reportItem: {
    flexDirection: 'row',
    marginBottom: SIZES.small,
  },
  reportLabel: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    width: '30%',
  },
  reportValue: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    width: '70%',
  },
  sectionTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginTop: SIZES.large,
    marginBottom: SIZES.medium,
  },
  analysisText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.medium,
    lineHeight: SIZES.large * 1.2,
  },
  subTitle: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  bulletPoint: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: 0,
    lineHeight: SIZES.large * 1.2,
  },
  legalButton: {
    paddingVertical: SIZES.small,
    marginTop: SIZES.small,
  },
  legalButtonText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.secondary,
  },
  resultCard: {
    backgroundColor: COLORS.white,
    padding: SIZES.large,
    marginBottom: SIZES.medium,
  },
  resultTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    marginBottom: SIZES.medium,
  },
  resultText: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginBottom: SIZES.medium,
    lineHeight: SIZES.large * 1.2,
  },
  noteText: {
    ...FONTS.regular,
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginBottom: SIZES.large,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: SIZES.medium,
    marginBottom: SIZES.small,
    paddingHorizontal: 4, // Add slight padding for better touch
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.base,
    padding: SIZES.large,
    width: '90%',
    maxHeight: '80%',
    ...SHADOWS.dark,
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalScrollContent: {
    paddingRight: SIZES.small,
  },
  modalTitle: {
    ...FONTS.bold,
    fontSize: SIZES.large,
    color: COLORS.primary,
    marginBottom: SIZES.large,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    marginBottom: SIZES.medium,
  },
  modalLabel: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    width: '40%',
  },
  modalValue: {
    ...FONTS.regular,
    fontSize: SIZES.font,
    color: COLORS.text,
    width: '60%',
    flexWrap: 'wrap',
  },
  modalButton: {
    marginTop: SIZES.large,
  },
  loadingContainer: {
    padding: SIZES.large,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.text,
    marginTop: SIZES.medium,
    textAlign: 'center',
  },
  nextStepsButton: {
    paddingVertical: SIZES.medium,
    paddingHorizontal: SIZES.small,
    borderRadius: SIZES.base,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SIZES.medium,
    backgroundColor: COLORS.secondary,
    minHeight: 50, // Ensure button has a minimum height
    // Add shadow for better visual feedback
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    width: '48%',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    width: '48%',
  },
  nextStepsButtonText: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.white,
    textAlign: 'center',
    paddingVertical: 4, // Add vertical padding to increase touch target
  },
  primaryButtonText: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.white,
    textAlign: 'center',
    paddingVertical: 4, // Add vertical padding to increase touch target
  },
  outlineButtonText: {
    ...FONTS.semiBold,
    fontSize: SIZES.medium,
    color: COLORS.primary,
    textAlign: 'center',
    paddingVertical: 4, // Add vertical padding to increase touch target
  },
  errorContainer: {
    padding: SIZES.medium,
    alignItems: 'center',
  },
  errorText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.error,
    textAlign: 'center',
  },
  noAnalysisContainer: {
    padding: SIZES.large,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.base,
    marginVertical: SIZES.medium,
  },
  noAnalysisText: {
    ...FONTS.medium,
    fontSize: SIZES.font,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: SIZES.medium,
  },
});