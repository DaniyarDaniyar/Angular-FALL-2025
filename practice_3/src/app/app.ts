import { Component, signal } from '@angular/core';
import { FormsModule  }  from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
  imports: [FormsModule],
})
export class App {
  Name = signal("Daniyar")
  Description = signal(
    "I enjoy building interactive web applications and exploring new technologies. My interests include web development, game design, and creating clean, user-friendly interfaces."
    );
  
  hello_gif = signal("https://miro.medium.com/1*2HNDCMOKx8xm_2JKkbrjAQ.gif");
  isButtonDisabled = signal(false);
  likes = signal(0);

  likeBtn(){
    this.likes.update((v: number) => v + 1);
    if(this.likes() >= 10){
      this.isButtonDisabled.set(true);
    }
  }

  Show = signal(false);
  thx = signal("🎉Thank you for visiting!🎉")
  ToggleFn(){
    this.Show.update((v: boolean) => !v);
  }

  email = signal("");
  subscribe = signal(false);

  subscribeFn(){
    if(this.email() !== ""){
      this.subscribe.set(true);
    }
  }
}
