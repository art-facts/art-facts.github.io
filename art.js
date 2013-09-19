var db = undefined;

function startup() {
    db = new Firebase("https://art-facts.firebaseio.com/");

    $('#submit_button').click(function() {
        var txt = $('#submit_text');
        var fact = txt.val();

        var target = db.child("unverified");
        target.push(fact);
        
        txt.val("");
        alert("Thank you for your submission. Your fact will be added to the database once it has been verified for accuracy.");
    });
}

window.addEventListener('load', startup);
