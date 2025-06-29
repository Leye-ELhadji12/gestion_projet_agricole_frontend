import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorMessageModal } from './error-message-modal';

describe('ErrorMessageModal', () => {
  let component: ErrorMessageModal;
  let fixture: ComponentFixture<ErrorMessageModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessageModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorMessageModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
