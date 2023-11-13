import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { CourseUnitsService } from '../course-units.service';
import { CourseUnitStateModel } from '../state/course.state';
import { Observable, catchError, debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs';
import { Unit } from '../unit-list/unit-list.component';
import { geCourseUnit } from '../state/course.selector';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-unit-content',
  templateUrl: './unit-content.component.html',
  styleUrls: ['./unit-content.component.css']
})
export class UnitContentComponent implements OnInit {

  unitForm: FormGroup = this.formBuilder.group({
    chapter_title: [''],
    topic_title: ['', [Validators.required]],
    duration: [''],
    transcript: ['', [Validators.required]]
  })

  courseUnit$!: Observable<Unit>

  embedding_id!: string
  course_id!: string
  topic_id!: string

  constructor(
    private spinner: NgxSpinnerService,
    private service: CourseUnitsService,
    private store: Store<{course: CourseUnitStateModel}>,
    private toast:ToastrService,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.courseUnit$ = this.setUnitObservable()
  }

  setUnitObservable(){
    return this.store.select(geCourseUnit).pipe(
      tap(unit => {
        this.course_id = unit.course_id
        this.topic_id = unit.unit_id
      }),
      switchMap(unit => {
        return this.service.getSingleUnit(unit).pipe(
          map((response: any) => {
            if(response.body && response.body.length > 0){
              this.embedding_id = response.body[0].embeded_id
              this.unitForm.patchValue({
                chapter_title: response.body[0].chapter_title,
                topic_title: response.body[0].topic_title,
                duration: response.body[0].duration,
                transcript: response.body[0].transcript
              })
              return {
                embeded_id: response.body[0].embeded_id.length > 0 ? response.body[0].embeded_id : "Not embedded yet",
                course_main_id: response.body[0].course_main_id,
                topic_id: response.body[0].topic_id,
                chapter_title: response.body[0].chapter_title,
                topic_title: response.body[0].topic_title,
                duration: response.body[0].duration,
                transcript: response.body[0].transcript
              }
            }
            else{
              this.unitForm.patchValue({
                chapter_title: "",
                topic_title: "",
                duration: "",
                transcript: ""
              })
              return {
                embeded_id: "",
                course_main_id: "",
                topic_id: "",
                chapter_title: "",
                topic_title: "",
                duration: "",
                transcript: ""
              }
            }
          })
        )
      })
    )
  }

  embedTranscript() {
    const raw_data = this.unitForm.getRawValue()
    const data = {
      ...raw_data,
      course_id: this.course_id,
      unit_id: this.topic_id,
      embedding_id: this.embedding_id
    }
    if(data.transcript.length == 0){
      this.toast.error('Transcript is empty', 'Error')
      return
    }

    this.spinner.show();
    this.service.upsertEmbedding(data).subscribe(response => {
      this.spinner.hide();
      this.toast.success('Transcript embedded successfully', 'Success')
      this.courseUnit$ = this.setUnitObservable()
    }, error => {
      this.spinner.hide();
      this.toast.error('Transcript embedding failed', 'Error')
    })
  }

  deleteEmbedding(){
    this.spinner.show();
    this.service.deleteEmbedding(this.embedding_id).subscribe(
      response => {
        this.spinner.hide();
        this.toast.success('Topic deleted successfully', 'Success')
        this.courseUnit$ = this.setUnitObservable()
      }
    )
  }

}
