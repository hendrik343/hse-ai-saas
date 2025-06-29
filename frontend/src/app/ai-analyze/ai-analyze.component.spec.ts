import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AiAnalyzeComponent } from './ai-analyze.component';

describe('AiAnalyzeComponent', () => {
  let component: AiAnalyzeComponent;
  let fixture: ComponentFixture<AiAnalyzeComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockFirestore: jasmine.SpyObj<Firestore>;
  let mockStorage: jasmine.SpyObj<Storage>;
  let mockAuth: jasmine.SpyObj<Auth>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockFirestore = jasmine.createSpyObj('Firestore', ['collection']);
    mockStorage = jasmine.createSpyObj('Storage', ['ref']);
    mockAuth = jasmine.createSpyObj('Auth', [], {
      user: of(null)
    });

    await TestBed.configureTestingModule({
      imports: [AiAnalyzeComponent, CommonModule, RouterTestingModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: Firestore, useValue: mockFirestore },
        { provide: Storage, useValue: mockStorage },
        { provide: Auth, useValue: mockAuth }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AiAnalyzeComponent);
    component = fixture.componentInstance;
  });

  describe('Initial State', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.selectedFile).toBeNull();
      expect(component.imagePreview).toBeNull();
      expect(component.isAnalyzing).toBeFalse();
      expect(component.analysisComplete).toBeFalse();
      expect(component.analysisResult).toBeNull();
      expect(component.uploadProgress).toBe(0);
      expect(component.currentStep).toBe(1);
    });
  });

  describe('File Selection', () => {
    it('should handle file selection with valid image file', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as any;

      spyOn(component, 'createImagePreview');
      component.onFileSelected(mockEvent);

      expect(component.selectedFile).toBe(mockFile);
      expect(component.createImagePreview).toHaveBeenCalledWith(mockFile);
    });

    it('should handle file selection with invalid file type', () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const mockEvent = {
        target: {
          files: [mockFile]
        }
      } as any;

      spyOn(component, 'createImagePreview');
      component.onFileSelected(mockEvent);

      expect(component.selectedFile).toBeNull();
      expect(component.createImagePreview).not.toHaveBeenCalled();
    });

    it('should handle file selection with null file', () => {
      const mockEvent = {
        target: {
          files: null
        }
      } as any;

      spyOn(component, 'createImagePreview');
      component.onFileSelected(mockEvent);

      expect(component.selectedFile).toBeNull();
      expect(component.createImagePreview).not.toHaveBeenCalled();
    });
  });

  describe('File Drop', () => {
    it('should handle file drop with valid image file', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        dataTransfer: {
          files: [mockFile]
        }
      } as any;

      spyOn(component, 'createImagePreview');
      component.onFileDrop(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.selectedFile).toBe(mockFile);
      expect(component.createImagePreview).toHaveBeenCalledWith(mockFile);
    });

    it('should handle file drop with invalid file type', () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const mockEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        dataTransfer: {
          files: [mockFile]
        }
      } as any;

      spyOn(component, 'createImagePreview');
      component.onFileDrop(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.selectedFile).toBeNull();
      expect(component.createImagePreview).not.toHaveBeenCalled();
    });

    it('should handle file drop with no files', () => {
      const mockEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        dataTransfer: {
          files: []
        }
      } as any;

      spyOn(component, 'createImagePreview');
      component.onFileDrop(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.selectedFile).toBeNull();
      expect(component.createImagePreview).not.toHaveBeenCalled();
    });

    it('should handle file drop with null files', () => {
      const mockEvent = {
        preventDefault: jasmine.createSpy('preventDefault'),
        dataTransfer: {
          files: null
        }
      } as any;

      spyOn(component, 'createImagePreview');
      component.onFileDrop(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.selectedFile).toBeNull();
      expect(component.createImagePreview).not.toHaveBeenCalled();
    });
  });

  describe('Image Preview', () => {
    it('should create image preview with valid file', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockReader = {
        onload: null as any,
        onerror: null as any,
        readAsDataURL: jasmine.createSpy('readAsDataURL')
      };

      spyOn(window, 'FileReader').and.returnValue(mockReader as any);
      component.createImagePreview(mockFile);

      expect(mockReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    });

    it('should handle invalid file type in createImagePreview', () => {
      const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      spyOn(console, 'error');
      spyOn(window, 'FileReader');

      component.createImagePreview(mockFile);

      expect(console.error).toHaveBeenCalledWith('Invalid file type selected');
      expect(window.FileReader).not.toHaveBeenCalled();
    });

    it('should handle null file in createImagePreview', () => {
      spyOn(console, 'error');
      spyOn(window, 'FileReader');

      component.createImagePreview(null as any);

      expect(console.error).toHaveBeenCalledWith('Invalid file type selected');
      expect(window.FileReader).not.toHaveBeenCalled();
    });
  });

  describe('Analysis Flow', () => {
    it('should not start analysis without file', () => {
      component.selectedFile = null;
      spyOn(component as any, 'uploadImage');

      component.startAnalysis();

      expect((component as any).uploadImage).not.toHaveBeenCalled();
    });

    it('should reset component state for new analysis', () => {
      component.selectedFile = new File(['test'], 'test.jpg');
      component.imagePreview = 'data:image/jpeg;base64,test';
      component.isAnalyzing = true;
      component.analysisComplete = true;
      component.analysisResult = {} as any;
      component.uploadProgress = 100;
      component.currentStep = 3;

      component.analyzeAnother();

      expect(component.selectedFile).toBeNull();
      expect(component.imagePreview).toBeNull();
      expect(component.isAnalyzing).toBeFalse();
      expect(component.analysisComplete).toBeFalse();
      expect(component.analysisResult).toBeNull();
      expect(component.uploadProgress).toBe(0);
      expect(component.currentStep).toBe(1);
    });
  });

  describe('PDF Generation', () => {
    it('should download PDF when analysis result exists', () => {
      const mockAnalysisResult = {
        summary: 'Test summary',
        severity: {
          level: 'Medium' as const,
          justification: 'Test justification'
        },
        rootCauses: ['Test root cause'],
        preventiveActions: ['Test preventive action'],
        complianceNotes: ['Test compliance note'],
        legalViolations: ['Test legal violation'],
        pdfReport: {
          title: 'AI Safety Analysis Report',
          date: new Date().toISOString(),
          sections: [
            { title: 'Resumo', content: '...' },
            { title: 'Gravidade e Justificação', content: '...' },
            { title: 'Violações Legais', content: '...' },
            { title: 'Causas Raiz', content: '...' },
            { title: 'Ações Preventivas', content: '...' },
            { title: 'Normas Aplicáveis', content: '...' }
          ]
        },
        violations: ['Test violation'],
        risks: ['Test risk'],
        recommendations: ['Test recommendation'],
        complianceScore: 75
      };

      component.analysisResult = mockAnalysisResult;
      const mockPdf = {
        setFontSize: jasmine.createSpy('setFontSize'),
        setFont: jasmine.createSpy('setFont'),
        setTextColor: jasmine.createSpy('setTextColor'),
        setFillColor: jasmine.createSpy('setFillColor'),
        setDrawColor: jasmine.createSpy('setDrawColor'),
        text: jasmine.createSpy('text'),
        rect: jasmine.createSpy('rect'),
        save: jasmine.createSpy('save'),
        internal: {
          pageSize: {
            getWidth: () => 595,
            getHeight: () => 842
          }
        }
      };

      spyOn(window as any, 'jsPDF').and.returnValue(mockPdf);

      component.downloadPDF();

      expect((window as any).jsPDF).toHaveBeenCalled();
    });

    it('should not download PDF when no analysis result', () => {
      component.analysisResult = null;
      spyOn(window as any, 'jsPDF');

      component.downloadPDF();

      expect((window as any).jsPDF).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate to dashboard', () => {
      component.goToDashboard();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });
});
