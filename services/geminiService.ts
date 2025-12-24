import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult } from "../types";

/**
 * 使用 Gemini AI 搜索地理位置
 * 结合语义理解，将自然语言转换为高德地图可用的 GCJ-02 坐标
 */
export const searchLocationWithGemini = async (query: string): Promise<SearchResult[]> => {
  // 按照准则：在调用时初始化，以确保始终获取最新的 process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `你是一个专业的地理位置专家和地图助手。
      用户搜索请求: "${query}"
      
      请根据该请求返回 1-3 个匹配的中国境内地点。
      要求：
      1. 坐标系：必须使用 GCJ-02 (火星坐标系)，这是高德地图 (AMap) 正常显示所必须的。
      2. 格式：严格按照指定的 JSON 格式返回。
      3. 精确度：经纬度请精确到小数点后 6 位。
      4. 语言：所有返回内容必须使用简体中文。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { 
                type: Type.STRING, 
                description: "地点的名称，例如：天安门、上海东方明珠" 
              },
              address: { 
                type: Type.STRING, 
                description: "详细的街道或区域地址" 
              },
              lat: { 
                type: Type.NUMBER, 
                description: "纬度 (GCJ-02)" 
              },
              lng: { 
                type: Type.NUMBER, 
                description: "经度 (GCJ-02)" 
              },
              description: { 
                type: Type.STRING, 
                description: "该地点的简短介绍，20字以内" 
              }
            },
            required: ["name", "address", "lat", "lng", "description"]
          }
        }
      }
    });

    // 准则：直接访问 .text 属性，而不是调用 .text()
    const jsonStr = response.text;
    
    if (!jsonStr) {
      console.warn("Gemini 返回了空内容");
      return [];
    }

    const results: SearchResult[] = JSON.parse(jsonStr.trim());
    return results;
  } catch (error) {
    console.error("Gemini 搜索地理位置时发生错误:", error);
    return [];
  }
