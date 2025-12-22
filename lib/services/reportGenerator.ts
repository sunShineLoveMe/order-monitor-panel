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
    // 使用更标准的A4比例 (595pt x 842pt)
    // 转换为 px (96dpi): 794px x 1123px
    reportDiv.style.width = '794px'; 
    reportDiv.style.background = '#ffffff';
    reportDiv.style.color = '#333333';
    reportDiv.style.padding = '0'; // 内部padding由容器控制
    reportDiv.style.position = 'absolute';
    reportDiv.style.top = '0';
    reportDiv.style.left = '-10000px'; // 移出视口但保持渲染
    
    // 添加报告内容
    reportDiv.innerHTML = this.generateReportHTML(analysisResult, order, thinkingSteps, options);
    
    // 将div添加到文档中
    document.body.appendChild(reportDiv);
    
    try {
      // 稍微延迟确保渲染完成（特别是图表和渐变）
      await new Promise(resolve => setTimeout(resolve, 300));

      // 将HTML转换为Canvas
      const canvas = await html2canvas(reportDiv, {
        scale: 2, // 提高分辨率
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.9); // 使用 JPEG 减小体积并提高兼容性
      
      // 初始化标准的 A4 PDF
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // 如果报告很长，需要分页
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
      
      return pdf;
    } catch (error) {
      console.error('PDF生成失败:', error);
      throw error;
    } finally {
      // 删除临时div
      if (document.body.contains(reportDiv)) {
        document.body.removeChild(reportDiv);
      }
    }
  }

  private generateReportHTML(
    analysisResult: OrderAnalysis,
    order: Order,
    thinkingSteps: ThinkingStep[],
    options: ReportGenerationOptions
  ): string {
    const today = new Date().toLocaleString('zh-CN');
    
    return `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; background-color: white;">
        <!-- Header -->
        <div style="border-bottom: 3px solid #1a202c; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <h1 style="margin: 0; color: #1a202c; font-size: 28px;">ARGUS AI 智能分析报告</h1>
            <p style="margin: 5px 0 0 0; color: #4a5568; font-size: 14px;">订单监控与风险评估系统</p>
          </div>
          <div style="text-align: right; color: #718096; font-size: 12px;">
            报告编号: ${order.order_number.replace(/-/g, '')}-${Date.now().toString().slice(-6)}<br>
            生成时间: ${today}
          </div>
        </div>

        <!-- Order Summary Card -->
        <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #2d3748; border-left: 4px solid #3182ce; padding-left: 10px;">订单核心数据</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
            <div><strong style="color: #4a5568;">订单编号:</strong> ${order.order_number}</div>
            <div><strong style="color: #4a5568;">客户名称:</strong> ${order.customer}</div>
            <div><strong style="color: #4a5568;">产品名称:</strong> ${order.product_name}</div>
            <div><strong style="color: #4a5568;">订单金额:</strong> ¥${order.value.toLocaleString()}</div>
            <div><strong style="color: #4a5568;">订单类型:</strong> ${order.type === 'inbound' ? '入库' : '出库'}</div>
            <div><strong style="color: #4a5568;">下单日期:</strong> ${new Date(order.date).toLocaleDateString('zh-CN')}</div>
          </div>
        </div>

        <!-- Risk Level -->
        <div style="margin-bottom: 30px; display: flex; align-items: center; justify-content: space-between; background: #fffaf0; border: 1px solid #feebc8; padding: 20px; border-radius: 8px;">
          <div style="width: 60%;">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #2d3748;">综合风险评估</h2>
            <p style="margin: 0; color: #744210; font-size: 14px;">基于多维 AI 感知模型计算得出的风险概率场值。</p>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 36px; font-weight: 800; color: ${this.getRiskColor(analysisResult.riskScore || 0)}; line-height: 1;">
              ${((analysisResult.riskScore || 0) * 100).toFixed(0)}<span style="font-size: 16px;">%</span>
            </div>
            <div style="font-size: 12px; color: #a0aec0; margin-top: 5px; font-weight: bold; text-transform: uppercase;">Risk Score</div>
          </div>
        </div>

        <!-- Thinking Steps -->
        ${options.includeThinking && thinkingSteps && thinkingSteps.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #2d3748; margin-bottom: 15px; border-bottom: 1px solid #edf2f7; padding-bottom: 10px;">AI 深度思考链路</h2>
            <div style="padding-left: 10px; border-left: 2px solid #e2e8f0; margin-left: 5px;">
              ${thinkingSteps.map((step, i) => `
                <div style="margin-bottom: 15px; position: relative;">
                  <div style="position: absolute; left: -21px; top: 0; width: 10px; height: 10px; border-radius: 50%; background: ${this.getStepColor(step.type)}; border: 2px solid white; box-shadow: 0 0 0 2px #e2e8f0;"></div>
                  <div style="font-size: 10px; text-transform: uppercase; color: #718096; margin-bottom: 2px; font-weight: bold;">Step ${i + 1} • ${step.type}</div>
                  <div style="font-size: 13px; color: #2d3748; line-height: 1.5;">${step.content}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Findings -->
        ${options.includeFindings && analysisResult.findings && analysisResult.findings.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #2d3748; margin-bottom: 15px; border-bottom: 1px solid #edf2f7; padding-bottom: 10px;">主要分析结论</h2>
            ${analysisResult.findings.map(finding => `
              <div style="margin-bottom: 15px; padding: 15px; border-radius: 6px; border-left: 4px solid ${this.getSeverityColor(finding.severity)}; background-color: #f8fafc;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <strong style="color: #2d3748; font-size: 15px;">${finding.category}</strong>
                  <span style="font-size: 11px; font-weight: bold; color: ${this.getSeverityColor(finding.severity)}; text-transform: uppercase;">${finding.severity} Severity</span>
                </div>
                <p style="margin: 0; font-size: 13px; color: #4a5568; line-height: 1.6;">${finding.description}</p>
                ${finding.recommendations && finding.recommendations.length > 0 ? `
                  <div style="margin-top: 10px; font-size: 12px; color: #2d3748; background: white; padding: 8px; border-radius: 4px;">
                    <strong style="display: block; margin-bottom: 4px; color: #718096;">执行建议:</strong>
                    ${finding.recommendations.map(r => `<div style="margin-bottom: 2px;">• ${r}</div>`).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- Final Summary -->
        ${options.includeSummary && analysisResult.summary ? `
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; color: #2d3748; margin-bottom: 15px; border-bottom: 1px solid #edf2f7; padding-bottom: 10px;">智能汇总建议</h2>
            <div style="background: #ebf8ff; border: 1px solid #bee3f8; color: #2c5282; padding: 20px; border-radius: 8px; font-size: 14px; line-height: 1.7;">
              ${analysisResult.summary}
            </div>
          </div>
        ` : ''}

        <!-- Footer -->
        <div style="margin-top: 50px; border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #a0aec0;">本报告由 Argus AI 自动生成，结果仅供参考。© ${new Date().getFullYear()} 订单监控面板</p>
          <div style="margin-top: 10px; font-size: 10px; color: #cbd5e0; font-family: monospace;">UUID: ${order.id} | ANALYTIC_ENGINE: V2.4</div>
        </div>
      </div>
    `;
  }

  private getRiskColor(score: number): string {
    if (score > 0.7) return '#e53e3e'; // 红色
    if (score > 0.4) return '#dd6b20'; // 橙色
    return '#38a169'; // 绿色
  }

  private getStepColor(type: string): string {
    switch (type) {
      case 'observation': return '#3182ce';
      case 'analysis': return '#805ad5';
      case 'insight': return '#d69e2e';
      case 'conclusion': return '#38a169';
      default: return '#718096';
    }
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'high': return '#e53e3e';
      case 'medium': return '#dd6b20';
      case 'low': return '#3182ce';
      default: return '#718096';
    }
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