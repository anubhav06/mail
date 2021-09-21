document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email('blank'));


  document.querySelector('#form-submit').onclick = function(){
    fetch("/emails", {
      method: "POST",
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(response => response.json())
    .then( () => {
      //Print Result
      load_mailbox('sent');
    })
    
    return false;
  };
  

  
  // By default, load the inbox
  load_mailbox('inbox');
});



function compose_email(emails) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  // Clear out composition fields
  if (emails == 'blank'){
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
  else{
    document.querySelector('#compose-recipients').value = emails.sender;

    // If subject already starts with 'Re:' then don't add 'Re:' to subject
    if (emails.subject[0] == 'R' && emails.subject[1] == 'e' && emails.subject[2] == ':'){
      document.querySelector('#compose-subject').value = emails.subject;
    }
    else{
      document.querySelector('#compose-subject').value = 'Re: ' + emails.subject;
    } 
    document.querySelector('#compose-body').value = "\nOn " + emails.timestamp + " " + emails.sender + " wrote: \n" + emails.body;
    //document.querySelector('#compose-body').innerHTML = "On " + emails.timestamp + " " + emails.sender + " wrote: &#13;&#10;" + emails.body;
    
    console.log(document.querySelector('#compose-body').value);
  }
}




// To load a mailbox - Inbox, Sent or Archived
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      
      for(let i=0;i<emails.length; i++)
      {
        const div = document.createElement('div');
        
        div.innerHTML = `
            <div class="row">
              <div class="columnSide"> <strong> ${emails[i].sender} </strong> </div>
              <div class="columnMiddle"> ${emails[i].subject} </div>
              <div class="columnSide"> ${emails[i].timestamp} </div>
            </div>
        `;
        document.querySelector('#emails-view').append(div);
        div.addEventListener('click', () => view_mail(emails, i, mailbox));

        // For changing the background color of mails if read or unread
        if (emails[i].read == true){
            var elements = document.getElementsByClassName('row');
            elements[i].style.backgroundColor = "lightgrey";
        }
      }
  })

}




// To load a particular mail's view
function view_mail(emails, i, mailbox){
  
  document.querySelector('#mail-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  
  document.querySelector('#sender').innerHTML = `${emails[i].sender}`;
  document.querySelector('#recipients').innerHTML = `${emails[i].recipients}`;
  document.querySelector('#subject').innerHTML = `${emails[i].subject}`;
  document.querySelector('#timestamp').innerHTML = `${emails[i].timestamp}`;
  console.log("To check \n" + emails[i].body);
  document.querySelector('#body').innerHTML = `${emails[i].body}`;
  console.log("After assigning: \n" + document.querySelector('#body').innerHTML);


  // To display Archive/Unarchive buttons for 'Inbox' and 'Archives' and not for 'Sent' 
  if (mailbox == "inbox"){
    document.querySelector('#archive').style.display = 'initial';
    document.querySelector('#archive').innerHTML = 'Archive';

    document.querySelector('#archive').onclick = function(){
      fetch('emails/' + emails[i].id, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true
        })
      })
      .then( () => {
        load_mailbox('inbox');
      })
    }

  }
  else if (mailbox == "archive"){
    document.querySelector('#archive').style.display = 'initial';
    document.querySelector('#archive').innerHTML = 'Unarchive';

    document.querySelector('#archive').onclick = function(){
      fetch('emails/' + emails[i].id, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
      .then( () => {
        load_mailbox('inbox');
      })
    }
  }
  else{
    document.querySelector('#archive').style.display = 'none';
  }


  // To mark the mail as read
  fetch('emails/' + emails[i].id, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  // To reply to a mail
  document.querySelector('#reply').onclick = function(){
    compose_email(emails[i]);
  }

}