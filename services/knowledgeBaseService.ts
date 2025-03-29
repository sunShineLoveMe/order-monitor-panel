/**
 * 知识库服务
 * 提供知识库相关的数据操作方法
 */

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'indexing' | 'error';
  embeddingModel: string;
}

export interface KnowledgeBaseDocument {
  id: string;
  knowledgeBaseId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  status: 'processing' | 'indexed' | 'failed';
  pageCount?: number;
  error?: string;
}

export interface CreateKnowledgeBaseParams {
  name: string;
  description?: string;
  embeddingModel: string;
}

/**
 * 模拟知识库数据
 */
const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: '1',
    name: '产品手册',
    description: '包含所有产品的使用手册和技术规格',
    documentCount: 15,
    createdAt: '2023-09-15T08:30:00Z',
    updatedAt: '2023-10-20T14:45:00Z',
    status: 'active',
    embeddingModel: 'openai'
  },
  {
    id: '2',
    name: '技术文档',
    description: '开发者文档和API使用指南',
    documentCount: 23,
    createdAt: '2023-08-10T10:15:00Z',
    updatedAt: '2023-10-22T16:20:00Z',
    status: 'active',
    embeddingModel: 'huggingface'
  },
  {
    id: '3',
    name: '培训材料',
    description: '员工培训和教育资源',
    documentCount: 8,
    createdAt: '2023-10-01T09:00:00Z',
    updatedAt: '2023-10-25T11:30:00Z',
    status: 'indexing',
    embeddingModel: 'openai'
  },
  {
    id: '4',
    name: '法律文件',
    description: '合同、协议和法律条款',
    documentCount: 12,
    createdAt: '2023-07-05T13:45:00Z',
    updatedAt: '2023-10-18T09:10:00Z',
    status: 'active',
    embeddingModel: 'local'
  },
  {
    id: '5',
    name: '市场研究',
    description: '行业报告和市场分析',
    documentCount: 7,
    createdAt: '2023-09-20T15:20:00Z',
    updatedAt: '2023-10-15T10:40:00Z',
    status: 'error',
    embeddingModel: 'openai'
  }
];

/**
 * 模拟文档数据
 */
const mockDocuments: Record<string, KnowledgeBaseDocument[]> = {
  '1': [
    {
      id: 'd1',
      knowledgeBaseId: '1',
      filename: '产品A使用说明.pdf',
      fileType: 'pdf',
      fileSize: 2458000,
      uploadedAt: '2023-09-15T09:30:00Z',
      status: 'indexed',
      pageCount: 24
    },
    {
      id: 'd2',
      knowledgeBaseId: '1',
      filename: '产品B技术规格.docx',
      fileType: 'docx',
      fileSize: 1824000,
      uploadedAt: '2023-09-17T10:15:00Z',
      status: 'indexed',
      pageCount: 18
    },
    {
      id: 'd3',
      knowledgeBaseId: '1',
      filename: '产品故障排除指南.pdf',
      fileType: 'pdf',
      fileSize: 3256000,
      uploadedAt: '2023-10-05T14:20:00Z',
      status: 'indexed',
      pageCount: 32
    }
  ],
  '2': [
    {
      id: 'd4',
      knowledgeBaseId: '2',
      filename: 'API参考手册.md',
      fileType: 'md',
      fileSize: 256000,
      uploadedAt: '2023-08-12T11:30:00Z',
      status: 'indexed',
      pageCount: 45
    },
    {
      id: 'd5',
      knowledgeBaseId: '2',
      filename: '开发者指南.pdf',
      fileType: 'pdf',
      fileSize: 4128000,
      uploadedAt: '2023-09-03T09:45:00Z',
      status: 'indexed',
      pageCount: 78
    }
  ],
  '3': [
    {
      id: 'd6',
      knowledgeBaseId: '3',
      filename: '新员工培训手册.pptx',
      fileType: 'pptx',
      fileSize: 5842000,
      uploadedAt: '2023-10-02T13:10:00Z',
      status: 'processing',
    },
    {
      id: 'd7',
      knowledgeBaseId: '3',
      filename: '技能发展计划.xlsx',
      fileType: 'xlsx',
      fileSize: 924000,
      uploadedAt: '2023-10-05T16:20:00Z',
      status: 'processing',
    }
  ],
  '4': [
    {
      id: 'd8',
      knowledgeBaseId: '4',
      filename: '服务条款.pdf',
      fileType: 'pdf',
      fileSize: 1256000,
      uploadedAt: '2023-07-15T10:30:00Z',
      status: 'indexed',
      pageCount: 12
    },
    {
      id: 'd9',
      knowledgeBaseId: '4',
      filename: '用户协议.docx',
      fileType: 'docx',
      fileSize: 984000,
      uploadedAt: '2023-08-20T09:15:00Z',
      status: 'indexed',
      pageCount: 8
    }
  ],
  '5': [
    {
      id: 'd10',
      knowledgeBaseId: '5',
      filename: '市场分析报告.pdf',
      fileType: 'pdf',
      fileSize: 3845000,
      uploadedAt: '2023-09-22T11:40:00Z',
      status: 'failed',
      error: '文件格式不兼容'
    }
  ]
};

/**
 * 模拟API请求延迟
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 知识库服务
 */
export const knowledgeBaseService = {
  /**
   * 获取所有知识库列表
   */
  async getKnowledgeBases(): Promise<KnowledgeBase[]> {
    await delay(800);
    return [...mockKnowledgeBases];
  },

  /**
   * 获取知识库详情
   */
  async getKnowledgeBase(id: string): Promise<KnowledgeBase | null> {
    await delay(500);
    const knowledgeBase = mockKnowledgeBases.find(kb => kb.id === id);
    return knowledgeBase ? { ...knowledgeBase } : null;
  },

  /**
   * 创建知识库
   */
  async createKnowledgeBase(params: CreateKnowledgeBaseParams): Promise<KnowledgeBase> {
    await delay(1000);
    
    const newId = (mockKnowledgeBases.length + 1).toString();
    const now = new Date().toISOString();
    
    const newKnowledgeBase: KnowledgeBase = {
      id: newId,
      name: params.name,
      description: params.description,
      documentCount: 0,
      createdAt: now,
      updatedAt: now,
      status: 'active',
      embeddingModel: params.embeddingModel
    };
    
    mockKnowledgeBases.push(newKnowledgeBase);
    mockDocuments[newId] = [];
    
    return { ...newKnowledgeBase };
  },

  /**
   * 删除知识库
   */
  async deleteKnowledgeBase(id: string): Promise<boolean> {
    await delay(800);
    
    const index = mockKnowledgeBases.findIndex(kb => kb.id === id);
    if (index !== -1) {
      mockKnowledgeBases.splice(index, 1);
      delete mockDocuments[id];
      return true;
    }
    
    return false;
  },

  /**
   * 获取知识库的文档列表
   */
  async getDocuments(knowledgeBaseId: string): Promise<KnowledgeBaseDocument[]> {
    await delay(700);
    
    const documents = mockDocuments[knowledgeBaseId] || [];
    return [...documents];
  },

  /**
   * 上传文档到知识库
   */
  async uploadDocument(knowledgeBaseId: string, file: File): Promise<KnowledgeBaseDocument> {
    await delay(1500);
    
    const knowledgeBase = mockKnowledgeBases.find(kb => kb.id === knowledgeBaseId);
    if (!knowledgeBase) {
      throw new Error('知识库不存在');
    }
    
    const fileType = file.name.split('.').pop() || '';
    const newDocId = `d${Date.now()}`;
    
    const newDocument: KnowledgeBaseDocument = {
      id: newDocId,
      knowledgeBaseId,
      filename: file.name,
      fileType,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'processing'
    };
    
    if (!mockDocuments[knowledgeBaseId]) {
      mockDocuments[knowledgeBaseId] = [];
    }
    
    mockDocuments[knowledgeBaseId].push(newDocument);
    
    // 更新知识库文档数量
    knowledgeBase.documentCount += 1;
    knowledgeBase.updatedAt = new Date().toISOString();
    
    // 模拟文档处理过程
    setTimeout(() => {
      const docIndex = mockDocuments[knowledgeBaseId].findIndex(d => d.id === newDocId);
      if (docIndex !== -1) {
        // 随机决定处理成功或失败
        const success = Math.random() > 0.1;
        
        if (success) {
          mockDocuments[knowledgeBaseId][docIndex].status = 'indexed';
          mockDocuments[knowledgeBaseId][docIndex].pageCount = Math.floor(Math.random() * 30) + 1;
        } else {
          mockDocuments[knowledgeBaseId][docIndex].status = 'failed';
          mockDocuments[knowledgeBaseId][docIndex].error = '处理过程中出错';
        }
      }
    }, 3000);
    
    return { ...newDocument };
  },

  /**
   * 删除文档
   */
  async deleteDocument(knowledgeBaseId: string, documentId: string): Promise<boolean> {
    await delay(600);
    
    if (!mockDocuments[knowledgeBaseId]) {
      return false;
    }
    
    const docIndex = mockDocuments[knowledgeBaseId].findIndex(d => d.id === documentId);
    if (docIndex !== -1) {
      mockDocuments[knowledgeBaseId].splice(docIndex, 1);
      
      // 更新知识库文档数量
      const knowledgeBase = mockKnowledgeBases.find(kb => kb.id === knowledgeBaseId);
      if (knowledgeBase) {
        knowledgeBase.documentCount -= 1;
        knowledgeBase.updatedAt = new Date().toISOString();
      }
      
      return true;
    }
    
    return false;
  }
}; 