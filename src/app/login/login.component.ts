import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from './login.service';
import { TAG_CURRENT_USER } from '../utils/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]]
  })

  constructor(
    private formBuilder: FormBuilder,
    private toast:ToastrService,
    private authService: LoginService,
    private router:Router
    ) 
    { }

  onSubmit(){
    // this.authService.userLogin(this.loginForm.getRawValue())
    // .subscribe(
    //   (response: HttpResponse<any>) => {
    //     let resp: any = response
    //     if(response.status != 200) {
    //       this.toast.error(resp.msg)
    //       return
    //     }
    //     console.log(response.body.user)
    //     localStorage.setItem(TAG_CURRENT_USER, JSON.stringify(response.body.user));
    //     this.toast.success('Good day ' + response.body.user.fullname + '!')
    //     this.router.navigate(['/nav'])
    //   }
    // )
    
    const mform = this.loginForm.getRawValue()
    this.authService.supaLogin(mform.email, mform.password)
    .then((response: any) => {
      console.log(response)
      if(response.error){
        this.toast.error(response.error.message)
        return
      }
      localStorage.setItem(TAG_CURRENT_USER, JSON.stringify(response.data));
      this.toast.success('Good day ' + response.data.fullname + '!')
      this.router.navigate(['/nav'])
    })
  }

}
