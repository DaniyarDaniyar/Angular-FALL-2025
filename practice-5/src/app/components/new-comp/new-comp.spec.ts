import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewComp } from './new-comp';

describe('NewComp', () => {
  let component: NewComp;
  let fixture: ComponentFixture<NewComp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewComp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewComp);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
