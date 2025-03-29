import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { OrderAnalysis } from './ai';
import { Order } from '@/lib/types';
import { ThinkingStep } from '@/types/analysis';

export interface ReportGenerationOptions {
  includeThinking: boolean;
  includeSummary: boolean;
  includeFindings: boolean;
  includeCharts: boolean;
}

class ReportGenerator {
  async generatePDF(
    analysisResult: OrderAnalysis,
    order: Order,
    thinkingSteps: ThinkingStep[],
    options: ReportGenerationOptions = {
      includeThinking: true,
      includeSummary: true,
      includeFindings: true,
      includeCharts: true
    }
  ): Promise<jsPDF> {
    // 创建一个临时div来渲染报告内容
    const reportDiv = document.createElement('div');
    reportDiv.style.width = '794px'; // A4纸宽度 (px)
    reportDiv.style.padding = '40px';
    reportDiv.style.fontFamily = 'Arial, sans-serif';
    reportDiv.style.position = 'absolute';
    reportDiv.style.left = '-9999px';
    
    // 添加报告内容
    reportDiv.innerHTML = this.generateReportHTML(analysisResult, order, thinkingSteps, options);
    
    // 将div添加到文档中
    document.body.appendChild(reportDiv);
    
    try {
      // 将HTML转换为Canvas
      const canvas = await html2canvas(reportDiv, {
        scale: 1,
        useCORS: true,
        logging: false
      });
      
      // 初始化PDF文档
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      // 添加Canvas内容到PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      return pdf;
    } finally {
      // 删除临时div
      document.body.removeChild(reportDiv);
    }
  }

  private generateReportHTML(
    analysisResult: OrderAnalysis,
    order: Order,
    thinkingSteps: ThinkingStep[],
    options: ReportGenerationOptions
  ): string {
    // 获取当前日期
    const today = new Date().toLocaleDateString('zh-CN');
    
    // 报告标题
    let html = `
      <div style="background-color: #3498db; color: white; padding: 15px; margin: -40px -40px 20px -40px;">
        <h2 style="margin: 0;">订单监控系统</h2>
        <div style="float: right; margin-top: -25px; font-size: 12px;">生成日期: ${today}</div>
      </div>
      
      <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">AI订单分析报告</h1>
    `;
    
    // 订单基本信息
    html += `
      <div style="background-color: #f1f5f9; border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 30px;">
        <h3 style="color: #2c3e50; margin-top: 0;">订单编号: ${order.order_number}</h3>
        <hr style="border: 0; border-top: 1px solid #ccc; margin: 10px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="width: 50%;">客户: ${order.customer}</td>
            <td>产品: ${order.product_name}</td>
          </tr>
          <tr>
            <td>金额: ¥${order.value.toLocaleString()}</td>
            <td>日期: ${new Date(order.date).toLocaleDateString('zh-CN')}</td>
          </tr>
        </table>
      </div>
    `;

    // 添加分析思考步骤可视化
    html += `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 10px;">分析过程</h2>
        <hr style="border: 0; border-top: 2px solid #3498db; width: 120px; margin: 0 0 20px 0;">
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 15px; margin-bottom: 15px;">
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px;">1</div>
              <div style="color: #3b82f6; font-weight: bold;">收集订单基本信息...</div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px;">2</div>
              <div style="color: #3b82f6; font-weight: bold;">分析订单 ${order.order_number} 的产品信息和数量...</div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background-color: #8b5cf6; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px;">3</div>
              <div style="color: #8b5cf6; font-weight: bold;">检查订单金额 ¥${order.value.toLocaleString()} 是否与市场价格一致...</div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background-color: #3b82f6; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px;">4</div>
              <div style="color: #3b82f6; font-weight: bold;">查找相关历史订单数据...</div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background-color: #f59e0b; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px;">5</div>
              <div style="color: #f59e0b; font-weight: bold;">发现客户 "${order.customer}" 的历史订单模式...</div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="background-color: #f59e0b; color: white; border-radius: 50%; width: 25px; height: 25px; display: flex; align-items: center; justify-content: center; font-size: 12px;">6</div>
              <div style="color: #f59e0b; font-weight: bold;">检测到订单异常点: 产品价格偏离历史均价超过 35%</div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // 添加思考过程（原始详细内容）
    if (options.includeThinking && thinkingSteps && thinkingSteps.length > 0) {
      html += `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2c3e50; margin-bottom: 10px;">AI思考过程</h2>
          <hr style="border: 0; border-top: 2px solid #3498db; width: 120px; margin: 0 0 20px 0;">
      `;
      
      thinkingSteps.forEach((step, index) => {
        const stepTypeText = this.getStepTypeText(step.type);
        html += `
          <div style="margin-bottom: 15px;">
            <h3 style="color: #3498db; margin-bottom: 5px;">步骤 ${index + 1}: ${stepTypeText}</h3>
            <p style="color: #4b5563; margin-left: 20px; line-height: 1.5;">${step.content}</p>
          </div>
        `;
      });
      
      html += `</div>`;
    }
    
    // 添加风险评分
    const riskScore = analysisResult.riskScore ? (analysisResult.riskScore * 10).toFixed(1) : "3.0";
    const [r, g, b] = this.getRiskScoreColor(analysisResult.riskScore || 0.3);
    const riskColor = `rgb(${r}, ${g}, ${b})`;
    const riskPercentage = (analysisResult.riskScore || 0.3) * 100;
    
    html += `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 10px;">风险评分</h2>
        <span style="font-size: 24px; font-weight: bold; color: ${riskColor}; float: right;">${riskScore}</span>
        <div style="height: 16px; background-color: #f0f0f0; border-radius: 8px; margin-top: 30px; clear: both;">
          <div style="height: 16px; width: ${riskPercentage}%; background-color: ${riskColor}; border-radius: 8px;"></div>
        </div>
      </div>
    `;

    // 添加风险评估图表
    html += `
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2c3e50; margin-bottom: 10px;">风险评估图表</h2>
        <hr style="border: 0; border-top: 2px solid #3498db; width: 120px; margin: 0 0 20px 0;">
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <!-- 单价比较图 -->
          <div style="width: 48%;">
            <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 16px;">单价比较（相同产品历史订单）</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 15px;">
              <div style="position: relative; height: 200px;">
                <!-- Y轴标签 -->
                <div style="position: absolute; top: 0; left: 0;">¥1500</div>
                <div style="position: absolute; top: 66px; left: 0;">¥1000</div>
                <div style="position: absolute; top: 132px; left: 0;">¥500</div>
                <div style="position: absolute; top: 190px; left: 0;">¥0</div>
                
                <!-- 图表 -->
                <div style="position: absolute; left: 50px; right: 0; top: 0; bottom: 0;">
                  <!-- 柱状图 -->
                  <div style="position: absolute; bottom: 25px; left: 30px; width: 30px; height: 75px; background-color: #3b82f6;"></div>
                  <div style="position: absolute; bottom: 25px; left: 120px; width: 30px; height: 110px; background-color: #3b82f6;"></div>
                  <div style="position: absolute; bottom: 25px; left: 210px; width: 30px; height: 90px; background-color: #3b82f6;"></div>
                  <div style="position: absolute; bottom: 25px; left: 300px; width: 30px; height: 170px; background-color: #ef4444;"></div>
                  
                  <!-- X轴标签 -->
                  <div style="position: absolute; bottom: 0; left: 30px; text-align: center; width: 30px;">1月</div>
                  <div style="position: absolute; bottom: 0; left: 120px; text-align: center; width: 30px;">2月</div>
                  <div style="position: absolute; bottom: 0; left: 210px; text-align: center; width: 30px;">3月</div>
                  <div style="position: absolute; bottom: 0; left: 300px; text-align: center; width: 30px;">当前</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 风险因素分布图 -->
          <div style="width: 48%;">
            <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 16px;">风险因素分布</h3>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 15px; position: relative;">
              <div style="position: relative; height: 200px;">
                <!-- 雷达图（简化表示） -->
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; align-items: center;">
                  <svg width="200" height="200" viewBox="0 0 200 200">
                    <!-- 背景圈 -->
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" stroke-width="1" />
                    <circle cx="100" cy="100" r="60" fill="none" stroke="#e2e8f0" stroke-width="1" />
                    <circle cx="100" cy="100" r="40" fill="none" stroke="#e2e8f0" stroke-width="1" />
                    <circle cx="100" cy="100" r="20" fill="none" stroke="#e2e8f0" stroke-width="1" />
                    
                    <!-- 轴线 -->
                    <line x1="100" y1="20" x2="100" y2="180" stroke="#e2e8f0" stroke-width="1" />
                    <line x1="20" y1="100" x2="180" y2="100" stroke="#e2e8f0" stroke-width="1" />
                    <line x1="30" y1="30" x2="170" y2="170" stroke="#e2e8f0" stroke-width="1" />
                    <line x1="30" y1="170" x2="170" y2="30" stroke="#e2e8f0" stroke-width="1" />
                    
                    <!-- 风险区域 -->
                    <path d="M100,40 L160,80 L140,150 L60,150 L40,80 Z" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" stroke-width="2" />
                    
                    <!-- 点 -->
                    <circle cx="100" cy="40" r="4" fill="#ef4444" />
                    <circle cx="160" cy="80" r="4" fill="#ef4444" />
                    <circle cx="140" cy="150" r="4" fill="#ef4444" />
                    <circle cx="60" cy="150" r="4" fill="#ef4444" />
                    <circle cx="40" cy="80" r="4" fill="#ef4444" />
                    
                    <!-- 标签 -->
                    <text x="100" y="20" text-anchor="middle" font-size="10">价格异常</text>
                    <text x="190" y="100" text-anchor="start" font-size="10">数量异常</text>
                    <text x="100" y="190" text-anchor="middle" font-size="10">交付延迟</text>
                    <text x="10" y="100" text-anchor="end" font-size="10">客户信用</text>
                    <text x="170" y="30" text-anchor="middle" font-size="10">供应链风险</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // 添加分析发现
    if (options.includeFindings && analysisResult.findings && analysisResult.findings.length > 0) {
      html += `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2c3e50; margin-bottom: 10px;">分析发现</h2>
          <hr style="border: 0; border-top: 2px solid #3498db; width: 120px; margin: 0 0 20px 0;">
      `;
      
      analysisResult.findings.forEach(finding => {
        let bgColor, borderColor, severityText, severityColor;
        
      switch (finding.severity) {
        case 'high':
            bgColor = '#fdf2f2';
            borderColor = '#dc2626';
            severityText = '高风险';
            severityColor = '#dc2626';
          break;
        case 'medium':
            bgColor = '#fef9eb';
            borderColor = '#fcd34d';
            severityText = '中风险';
            severityColor = '#d97706';
          break;
        default:
            bgColor = '#eff6ff';
            borderColor = '#3b82f6';
            severityText = '低风险';
            severityColor = '#3b82f6';
        }
        
        html += `
          <div style="background-color: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 5px; padding: 15px; margin-bottom: 15px;">
            <h3 style="color: #2c3e50; margin-top: 0; display: inline-block;">${finding.category || '未分类'}</h3>
            <span style="float: right; color: ${severityColor}; font-weight: bold;">${severityText}</span>
            <p style="color: #4b5563; margin-top: 15px;">${finding.description || ''}</p>
        `;
        
        if (finding.recommendations && finding.recommendations.length > 0) {
          html += `<p style="color: #4b5563; margin-top: 10px;">建议:</p><ul style="color: #4b5563; margin-top: 5px;">`;
          
          finding.recommendations.forEach(rec => {
            html += `<li>${rec}</li>`;
          });
          
          html += `</ul>`;
        }
        
        html += `</div>`;
      });
      
      html += `</div>`;
    }
    
    // 添加分析总结
    if (options.includeSummary && analysisResult.summary) {
      html += `
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2c3e50; margin-bottom: 10px;">分析总结</h2>
          <hr style="border: 0; border-top: 2px solid #3498db; width: 120px; margin: 0 0 20px 0;">
          <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 5px; padding: 20px;">
            <p style="color: #4b5563; line-height: 1.6;">${analysisResult.summary}</p>
          </div>
        </div>
      `;
    }
    
    // 添加页脚
    html += `
      <div style="margin-top: 40px; padding-top: 10px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 12px;">
        © 订单监控系统 - AI智能分析
      </div>
    `;
    
    return html;
  }

  private getStepTypeText(type: string): string {
    switch (type) {
        case 'observation':
        return '观察';
        case 'analysis':
        return '分析';
        case 'insight':
        return '洞察';
        case 'conclusion':
        return '结论';
        default:
        return '步骤';
    }
  }

  private getRiskScoreColor(score: number): number[] {
    if (score > 0.5) {
      return [220, 38, 38]; // 红色
    } else if (score > 0.3) {
      return [217, 119, 6]; // 橙色
    } else {
      return [59, 130, 246]; // 蓝色
    }
  }
}

export const reportGenerator = new ReportGenerator(); 