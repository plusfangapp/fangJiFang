declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      logging?: boolean;
      letterRendering?: boolean;
      allowTaint?: boolean;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: 'portrait' | 'landscape';
    };
  }

  interface Html2PdfInstance {
    from(element: HTMLElement): Html2PdfInstance;
    set(options: Html2PdfOptions): Html2PdfInstance;
    save(): Promise<void>;
    outputPdf(): any;
    outputImg(): any;
  }

  function html2pdf(): Html2PdfInstance;
  function html2pdf(element: HTMLElement, options?: Html2PdfOptions): Promise<void>;

  export = html2pdf;
}