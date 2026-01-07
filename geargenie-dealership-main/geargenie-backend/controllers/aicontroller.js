import Booking from "../models/Booking.js";
import groq from "../groqClient.js";

export const generateAIMechanicSummary = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const totalEstimatedCostUSD = booking.serviceEstimate?.totalEstimatedCostUSD || 0;

    const obdData = booking.obdData;
    if (!obdData || Object.keys(obdData).length === 0) {
      return res.status(400).json({ message: "No OBD data available" });
    }

    const data = { ...obdData, totalEstimatedCostUSD };

    const prompt = `
You are generating a professional, human-friendly mechanic report for a dealership dashboard.
Write everything in third-person only.

User's Name: ${booking.userName || "the user"}
Total Estimated Cost: $${totalEstimatedCostUSD} USD

---
### SUPER IMPORTANT
Only analyze the following REAL OBD sensor fields **if they exist in the JSON**:

- engineCoolantTemperature  
- engineOilTemperature  
- batteryVoltage  
- rpm  
- throttlePosition  
- shortTermFuelTrim  
- longTermFuelTrim  
- intakeAirTemperature  
- mapSensor  
- o2SensorVoltage  
-Total Estimated Cost USD (from booking object)
These are the ONLY valid diagnostic values.

❌ Ignore ALL other keys completely.
Do NOT generate a section for:
- id  
- vin  
- speed  
- timestamp  
- sample number  
- metadata fields  
- anything else not listed above  

If a field is not one of the valid OBD sensor names → SKIP it entirely.

---
### DO NOT MENTION MISSING VALUES
NEVER write:
- no data available  
- missing  
- not provided  
- unavailable  
- N/A  

If a sensor is missing → DO NOT mention it at all.

---
GIVEN OBD DATA
${JSON.stringify(data, null, 2)}

---
### OUTPUT FORMAT

⚠️ FIRST include a brief overall summary paragraph that explicitly states:
- the user name in third person
- the total estimated cost = $${totalEstimatedCostUSD} USD

Then for EACH VALID SENSOR present in the JSON:

**Component Name:**  
- **Interpretation:**  
- **Why the Issue Occurred:**  
- **What to Check:**  
- **How to Fix:** 
- Total Estimated Cost: $${totalEstimatedCostUSD} USD

After all sensor sections, include:

**Estimated Cost Summary:**  
- Clearly restate the total estimated repair cost based on identified issues: $${totalEstimatedCostUSD} USD.
- Keep it short, clean, and professional.

Do NOT generate sections for non-sensor keys.
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.4,
    });

    const summary =
      completion.choices?.[0]?.message?.content || "No summary generated.";

    booking.aiSummary = summary;
    await booking.save();

    res.json({ aiSummary: summary });

  } catch (err) {
    console.error("AI Summary Error:", err);
    res.status(500).json({ message: "AI error", error: err.message });
  }
};
