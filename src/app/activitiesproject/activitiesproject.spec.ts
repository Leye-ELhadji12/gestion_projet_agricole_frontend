import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Activitiesproject } from './activitiesproject';

describe('Activitiesproject', () => {
  let component: Activitiesproject;
  let fixture: ComponentFixture<Activitiesproject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Activitiesproject]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Activitiesproject);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
