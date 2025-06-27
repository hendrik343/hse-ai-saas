import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiAnalyzeComponent } from './ai-analyze.component';

describe('AiAnalyzeComponent', () => {
  let component: AiAnalyzeComponent;
  let fixture: ComponentFixture<AiAnalyzeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiAnalyzeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiAnalyzeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
