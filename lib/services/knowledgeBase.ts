"use client";

import { v4 as uuidv4 } from 'uuid';

// 知识库类型定义
export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  embeddingModel: string;
  documentCount: number;
  status: 'active' | 'indexing' | 'error';
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

// 创建知识库的请求参数
export interface CreateKnowledgeBaseRequest {
  name: string;
  description?: string;
  embeddingModel: string;
}

// 更新知识库的请求参数
export interface UpdateKnowledgeBaseRequest {
  name?: string;
  description?: string;
  embeddingModel?: string;
}

// 知识库文档类型
export interface KnowledgeBaseDocument {
  id: string;
  knowledgeBaseId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  status: 'processed' | 'processing' | 'error';
  createdAt: Date;
  updatedAt: Date;
  error?: string;
  chunkCount?: number;
}

// 模拟本地存储的键名
const STORAGE_KEY = 'order-monitor-knowledge-bases';

class KnowledgeBaseService {
  private knowledgeBases: KnowledgeBase[] = [];

  constructor() {
    this.loadFromStorage();
  }

  // 从localStorage加载知识库
  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        // 将日期字符串转换回Date对象
        const parsedData = JSON.parse(storedData, (key, value) => {
          if (key === 'createdAt' || key === 'updatedAt') {
            return new Date(value);
          }
          return value;
        });
        this.knowledgeBases = parsedData;
      }
    } catch (error) {
      console.error('加载知识库数据失败:', error);
      this.knowledgeBases = [];
    }
  }

  // 保存知识库到localStorage
  private saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.knowledgeBases));
    } catch (error) {
      console.error('保存知识库数据失败:', error);
    }
  }

  // 获取所有知识库
  async getKnowledgeBases(): Promise<KnowledgeBase[]> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.knowledgeBases];
  }

  // 获取指定ID的知识库
  async getKnowledgeBase(id: string): Promise<KnowledgeBase | null> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 200));
    const kb = this.knowledgeBases.find(kb => kb.id === id);
    return kb ? { ...kb } : null;
  }

  // 创建新知识库
  async createKnowledgeBase(request: CreateKnowledgeBaseRequest): Promise<KnowledgeBase> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    const now = new Date();
    const newKnowledgeBase: KnowledgeBase = {
      id: uuidv4(),
      name: request.name,
      description: request.description,
      embeddingModel: request.embeddingModel,
      documentCount: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.knowledgeBases.push(newKnowledgeBase);
    this.saveToStorage();

    return { ...newKnowledgeBase };
  }

  // 更新知识库
  async updateKnowledgeBase(id: string, request: UpdateKnowledgeBaseRequest): Promise<KnowledgeBase | null> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    const index = this.knowledgeBases.findIndex(kb => kb.id === id);
    if (index === -1) return null;

    const updatedKnowledgeBase = {
      ...this.knowledgeBases[index],
      ...request,
      updatedAt: new Date()
    };

    this.knowledgeBases[index] = updatedKnowledgeBase;
    this.saveToStorage();

    return { ...updatedKnowledgeBase };
  }

  // 删除知识库
  async deleteKnowledgeBase(id: string): Promise<boolean> {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 400));

    const initialLength = this.knowledgeBases.length;
    this.knowledgeBases = this.knowledgeBases.filter(kb => kb.id !== id);

    if (this.knowledgeBases.length !== initialLength) {
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  // 上传文档到知识库（模拟实现）
  async uploadDocument(knowledgeBaseId: string, file: File): Promise<KnowledgeBaseDocument> {
    // 确认知识库存在
    const kb = this.knowledgeBases.find(kb => kb.id === knowledgeBaseId);
    if (!kb) throw new Error(`知识库不存在: ${knowledgeBaseId}`);

    // 模拟网络延迟和处理时间
    await new Promise(resolve => setTimeout(resolve, 800));

    // 更新知识库状态为索引中
    const kbIndex = this.knowledgeBases.findIndex(kb => kb.id === knowledgeBaseId);
    this.knowledgeBases[kbIndex].status = 'indexing';
    this.knowledgeBases[kbIndex].updatedAt = new Date();
    this.saveToStorage();

    // 模拟文档处理
    const newDocument: KnowledgeBaseDocument = {
      id: uuidv4(),
      knowledgeBaseId,
      filename: file.name,
      fileType: file.type,
      fileSize: file.size,
      status: 'processing',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 模拟处理完成
    setTimeout(() => {
      // 更新知识库状态和文档计数
      const kbIndex = this.knowledgeBases.findIndex(kb => kb.id === knowledgeBaseId);
      if (kbIndex !== -1) {
        this.knowledgeBases[kbIndex].status = 'active';
        this.knowledgeBases[kbIndex].documentCount += 1;
        this.knowledgeBases[kbIndex].updatedAt = new Date();
        this.saveToStorage();
      }
    }, 5000); // 假设5秒后处理完成

    return newDocument;
  }
}

// 导出单例实例
export const knowledgeBaseService = new KnowledgeBaseService(); 