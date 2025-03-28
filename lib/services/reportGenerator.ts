import jsPDF from 'jspdf';
import 'jspdf-autotable';
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
  /**
   * 生成AI分析报告PDF
   */
  generatePDF(
    analysisResult: OrderAnalysis,
    order: Order,
    thinkingSteps: ThinkingStep[],
    options: ReportGenerationOptions = {
      includeThinking: true,
      includeSummary: true,
      includeFindings: true,
      includeCharts: true
    }
  ): jsPDF {
    // 初始化PDF文档
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // 添加页眉
    this.addHeader(doc, yPos);
    yPos += 25;

    // 添加报告标题
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80); // 深蓝灰色
    doc.setFont("helvetica", "bold");
    doc.text("AI订单分析报告", pageWidth / 2, yPos, { align: "center" });
    yPos += 20;

    // 添加订单基本信息
    this.addOrderInfo(doc, order, yPos, margin, contentWidth);
    yPos += 45;

    // 添加风险评分
    this.addRiskScore(doc, analysisResult, yPos, margin, contentWidth);
    yPos += 30;

    // 添加分析发现
    if (options.includeFindings && analysisResult.findings && analysisResult.findings.length > 0) {
      yPos = this.addFindings(doc, analysisResult, yPos, margin, contentWidth);
    }

    // 添加分析总结
    if (options.includeSummary && analysisResult.summary) {
      yPos = this.addSummary(doc, analysisResult, yPos, margin, contentWidth);
    }

    // 添加思考过程
    if (options.includeThinking && thinkingSteps && thinkingSteps.length > 0) {
      // 如果页面剩余空间不够，添加新页面
      if (yPos > doc.internal.pageSize.getHeight() - 100) {
        doc.addPage();
        yPos = margin;
      }
      
      yPos = this.addThinkingProcess(doc, thinkingSteps, yPos, margin, contentWidth);
    }

    // 添加页脚
    this.addFooter(doc);

    return doc;
  }

  /**
   * 添加页眉
   */
  private addHeader(doc: jsPDF, yPos: number): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // 标题栏背景
    doc.setFillColor(52, 152, 219); // 现代蓝色
    doc.rect(0, 0, pageWidth, 15, 'F');
    
    // 公司Logo (文字替代)
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255); // 白色
    doc.setFont("helvetica", "bold");
    doc.text("订单监控系统", 20, 10);
    
    // 日期
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255); // 白色
    doc.setFont("helvetica", "normal");
    const today = new Date().toLocaleDateString('zh-CN');
    doc.text(`生成日期: ${today}`, pageWidth - 20, 10, { align: "right" });
  }

  /**
   * 添加订单基本信息
   */
  private addOrderInfo(doc: jsPDF, order: Order, yPos: number, margin: number, contentWidth: number): void {
    doc.setFillColor(241, 245, 249); // 淡蓝灰色
    doc.setDrawColor(220, 220, 220);
    doc.roundedRect(margin, yPos, contentWidth, 38, 4, 4, 'FD');
    
    // 订单编号标题
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80); // 深蓝灰色
    doc.setFont("helvetica", "bold");
    doc.text(`订单编号: ${order.order_number}`, margin + 10, yPos + 10);
    
    // 分隔线
    doc.setDrawColor(200, 200, 200);
    doc.line(margin + 10, yPos + 14, margin + contentWidth - 10, yPos + 14);
    
    // 订单详情
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99); // 深灰色
    doc.text(`客户: ${order.customer}`, margin + 10, yPos + 22);
    doc.text(`产品: ${order.product_name}`, margin + contentWidth / 2, yPos + 22);
    doc.text(`金额: ¥${order.value.toLocaleString()}`, margin + 10, yPos + 32);
    doc.text(`日期: ${new Date(order.date).toLocaleDateString('zh-CN')}`, margin + contentWidth / 2, yPos + 32);
  }

  /**
   * 添加风险评分
   */
  private addRiskScore(doc: jsPDF, analysisResult: OrderAnalysis, yPos: number, margin: number, contentWidth: number): void {
    const riskScore = analysisResult.riskScore ? (analysisResult.riskScore * 10).toFixed(1) : "3.0";
    
    // 风险评分标题
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80); // 深蓝灰色
    doc.text("风险评分", margin, yPos);
    
    // 评分值
    doc.setFontSize(18);
    
    // 设置颜色
    const [r, g, b] = this.getRiskScoreColor(analysisResult.riskScore || 0.3);
    doc.setTextColor(r, g, b);
    
    doc.text(riskScore, margin + contentWidth - 20, yPos);
    
    // 风险条
    const barWidth = contentWidth - 50;
    const barHeight = 8;
    const barY = yPos + 12;
    
    // 背景
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(margin, barY, barWidth, barHeight, 4, 4, 'F');
    
    // 填充部分
    const fillWidth = barWidth * (analysisResult.riskScore || 0.3);
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin, barY, fillWidth, barHeight, 4, 4, 'F');
  }

  /**
   * 添加分析发现
   */
  private addFindings(doc: jsPDF, analysisResult: OrderAnalysis, yPos: number, margin: number, contentWidth: number): number {
    // 分析发现标题
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80); // 深蓝灰色
    doc.text("分析发现", margin, yPos);
    
    // 分隔线
    doc.setDrawColor(52, 152, 219); // 蓝色
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 5, margin + 60, yPos + 5);
    doc.setLineWidth(0.1);
    
    yPos += 12;
    
    if (!analysisResult.findings || analysisResult.findings.length === 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(128, 128, 128);
      doc.text("无分析发现", margin, yPos);
      return yPos + 10;
    }
    
    analysisResult.findings.forEach((finding, index) => {
      // 如果页面剩余空间不够，添加新页面
      if (yPos > doc.internal.pageSize.getHeight() - 70) {
        doc.addPage();
        yPos = margin;
      }
      
      let boxHeight = 35;
      const description = finding.description || '';
      const recommendations = finding.recommendations || [];
      
      // 根据内容估算高度
      const descLineCount = Math.ceil(doc.getTextWidth(description) / (contentWidth - 30));
      boxHeight += (descLineCount - 1) * 7;
      boxHeight += recommendations.length * 7;
      
      // 绘制框
      let boxColor;
      let borderColor;
      switch (finding.severity) {
        case 'high':
          boxColor = [253, 242, 242]; // 浅红色
          borderColor = [220, 38, 38]; // 红色边框
          break;
        case 'medium':
          boxColor = [254, 249, 235]; // 浅橙色
          borderColor = [252, 211, 77]; // 橙色边框
          break;
        default:
          boxColor = [239, 246, 255]; // 浅蓝色
          borderColor = [59, 130, 246]; // 蓝色边框
      }
      
      doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 4, 4, 'FD');
      
      // 添加标题
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(44, 62, 80); // 深蓝灰色
      doc.text(finding.category || '未分类', margin + 10, yPos + 12);
      
      // 添加严重性
      let severityText;
      let severityColor;
      switch (finding.severity) {
        case 'high':
          severityText = "高风险";
          severityColor = [220, 38, 38]; // 红色
          break;
        case 'medium':
          severityText = "中风险";
          severityColor = [217, 119, 6]; // 橙色
          break;
        default:
          severityText = "低风险";
          severityColor = [59, 130, 246]; // 蓝色
      }
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
      doc.text(severityText, margin + contentWidth - 30, yPos + 12);
      
      // 添加描述
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99); // 深灰色
      doc.text(description, margin + 10, yPos + 24, { maxWidth: contentWidth - 20 });
      
      // 添加建议
      let recY = yPos + 30 + (descLineCount - 1) * 7;
      
      if (recommendations.length > 0) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(75, 85, 99); // 深灰色
        doc.text("建议:", margin + 10, recY);
        recY += 6;
        
        doc.setFont("helvetica", "normal");
        recommendations.forEach(rec => {
          doc.text(`• ${rec}`, margin + 15, recY);
          recY += 7;
        });
      }
      
      yPos += boxHeight + 8;
    });
    
    return yPos;
  }

  /**
   * 添加分析总结
   */
  private addSummary(doc: jsPDF, analysisResult: OrderAnalysis, yPos: number, margin: number, contentWidth: number): number {
    // 如果页面剩余空间不够，添加新页面
    if (yPos > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage();
      yPos = margin;
    }
    
    // 分析总结标题
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80); // 深蓝灰色
    doc.text("分析总结", margin, yPos);
    
    // 分隔线
    doc.setDrawColor(52, 152, 219); // 蓝色
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 5, margin + 60, yPos + 5);
    doc.setLineWidth(0.1);
    
    yPos += 12;
    
    if (!analysisResult.summary) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(128, 128, 128);
      doc.text("无分析总结", margin, yPos);
      return yPos + 10;
    }
    
    // 绘制框
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240); // 淡灰色边框
    
    const textWidth = contentWidth - 30;
    const textLineCount = Math.ceil(doc.getTextWidth(analysisResult.summary) / textWidth) + 2;
    const boxHeight = 20 + (textLineCount - 1) * 7;
    
    doc.roundedRect(margin, yPos, contentWidth, boxHeight, 4, 4, 'FD');
    
    // 添加总结文本
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99); // 深灰色
    doc.text(analysisResult.summary, margin + 15, yPos + 15, { maxWidth: textWidth });
    
    return yPos + boxHeight + 15;
  }

  /**
   * 添加思考过程
   */
  private addThinkingProcess(doc: jsPDF, thinkingSteps: ThinkingStep[], yPos: number, margin: number, contentWidth: number): number {
    // 思考过程标题
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80); // 深蓝灰色
    doc.text("AI思考过程", margin, yPos);
    
    // 分隔线
    doc.setDrawColor(52, 152, 219); // 蓝色
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 5, margin + 70, yPos + 5);
    doc.setLineWidth(0.1);
    
    yPos += 15;
    
    if (!thinkingSteps || thinkingSteps.length === 0) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(128, 128, 128);
      doc.text("无思考过程记录", margin, yPos);
      return yPos + 10;
    }
    
    thinkingSteps.forEach((step, index) => {
      // 如果页面剩余空间不够，添加新页面
      if (yPos > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        yPos = margin;
      }
      
      let boxColor;
      let borderColor;
      let textColor;
      let icon;
      
      switch (step.type) {
        case 'observation':
          boxColor = [239, 246, 255]; // 浅蓝色
          borderColor = [59, 130, 246]; // 蓝色边框
          textColor = [37, 99, 235]; // 蓝色
          icon = "👁️";
          break;
        case 'analysis':
          boxColor = [243, 240, 255]; // 浅紫色
          borderColor = [139, 92, 246]; // 紫色边框
          textColor = [124, 58, 237]; // 紫色
          icon = "🔍";
          break;
        case 'insight':
          boxColor = [254, 249, 235]; // 浅橙色
          borderColor = [252, 211, 77]; // 橙色边框
          textColor = [217, 119, 6]; // 橙色
          icon = "💡";
          break;
        case 'conclusion':
          boxColor = [236, 253, 245]; // 浅绿色
          borderColor = [52, 211, 153]; // 绿色边框
          textColor = [5, 150, 105]; // 绿色
          icon = "✓";
          break;
        default:
          boxColor = [243, 244, 246]; // 浅灰色
          borderColor = [209, 213, 219]; // 灰色边框
          textColor = [107, 114, 128]; // 灰色
          icon = "•";
      }
      
      const textWidth = contentWidth - 40;
      const textLineCount = Math.ceil(doc.getTextWidth(step.content) / textWidth) + 1;
      const boxHeight = 25 + (textLineCount - 1) * 7;
      
      // 绘制框
      doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
      doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
      doc.roundedRect(margin, yPos, contentWidth, boxHeight, 4, 4, 'FD');
      
      // 步骤编号和类型
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(`${icon} ${this.capitalizeFirstLetter(step.type)} ${index + 1}/${thinkingSteps.length}`, margin + 10, yPos + 12);
      
      // 步骤内容
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99); // 深灰色
      doc.text(step.content, margin + 10, yPos + 22, { maxWidth: textWidth });
      
      yPos += boxHeight + 6;
    });
    
    return yPos;
  }

  /**
   * 添加页脚
   */
  private addFooter(doc: jsPDF): void {
    const pageCount = doc.internal.pages.length - 1;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // 页脚背景
      doc.setFillColor(248, 250, 252); // 浅灰蓝色
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      // 页码
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99); // 深灰色
      doc.text(`第 ${i} 页，共 ${pageCount} 页`, pageWidth / 2, pageHeight - 10, { align: "center" });
      
      // 版权信息
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139); // 灰蓝色
      doc.text("© 订单监控系统 - AI智能分析", pageWidth / 2, pageHeight - 5, { align: "center" });
    }
  }

  /**
   * 获取风险评分颜色
   */
  private getRiskScoreColor(score: number): number[] {
    if (score > 0.5) {
      return [220, 38, 38]; // 红色
    } else if (score > 0.3) {
      return [217, 119, 6]; // 橙色
    } else {
      return [59, 130, 246]; // 蓝色
    }
  }

  /**
   * 首字母大写
   */
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export const reportGenerator = new ReportGenerator(); 