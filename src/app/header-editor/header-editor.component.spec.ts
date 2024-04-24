import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderEditorComponent } from './header-editor.component';

describe('HeaderEditorComponent', () => {
  let component: HeaderEditorComponent;
  let fixture: ComponentFixture<HeaderEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HeaderEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
