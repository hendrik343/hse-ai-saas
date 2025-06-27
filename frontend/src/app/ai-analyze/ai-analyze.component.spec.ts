import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AiAnalyzeComponent } from './ai-analyze.component';
import { Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { Auth } from '@angular/fire/auth';
import { of } from 'rxjs';

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
    mockAuth = jasmine.createSpyObj('Auth', ['user']);

    await TestBed.configureTestingModule({
      imports: [AiAnalyzeComponent],
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

  it('should handle file selection', () => {
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

  it('should handle file drop', () => {
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

  it('should create image preview', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockReader = {
      onload: null as any,
      readAsDataURL: jasmine.createSpy('readAsDataURL')
    ***REMOVED***

    spyOn(window, 'FileReader').and.returnValue(mockReader as any);
    component.createImagePreview(mockFile);

    expect(mockReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
  });

  it('should navigate to dashboard', () => {
    component.goToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
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

  it('should not start analysis without file', () => {
    component.selectedFile = null;
    spyOn(component as any, 'uploadImage');
    
    component.startAnalysis();
    
    expect((component as any).uploadImage).not.toHaveBeenCalled();
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

  it('should download PDF when analysis result exists', () => {
    const mockAnalysisResult = {
      compliance: {
        score: 85,
        issues: ['Test issue'],
        recommendations: ['Test recommendation']
      },
      risk: {
        level: 'medium' as const,
        factors: ['Test factor'],
        mitigation: ['Test mitigation']
      },
      legal: {
        violations: ['Test violation'],
        requirements: ['Test requirement'],
        penalties: ['Test penalty']
      }
    ***REMOVED***

    component.analysisResult = mockAnalysisResult;
    const mockPdf = {
      setFontSize: jasmine.createSpy('setFontSize'),
      text: jasmine.createSpy('text'),
      save: jasmine.createSpy('save')
    ***REMOVED***
    
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
