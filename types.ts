export interface Location { id: string; name: string; address: string; lat: number; lng: number; timestamp: number; }
export interface SearchResult { name: string; address: string; lat: number; lng: number; description: string; }
export enum AppPreset { DINGTALK = '钉钉', WECHAT = '微信', DOUYIN = '抖音', GENERIC = '系统全局' }
