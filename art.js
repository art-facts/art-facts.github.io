var db = undefined;
var auth = undefined;

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

    auth = new FirebaseSimpleLogin(db, function(error, user) {
        if(user) {
            enableModerator();
        }
    });
}

function enableModerator() {
    $('#verify').show();

    var unverified = db.child("unverified");

    var modlist = $('#unverified_list');

    unverified.on('child_added', function(snap) {
        var li = document.createElement('li');
        var ref = snap.ref();
        li.id = snap.name();

        var txt = snap.val();

        var approve = document.createElement('button');
        approve.onclick = function() {
            db.child('facts').push({fact: txt, votes: 1});
            db.child('total_votes').transaction(function(x) { return x + 1; });
            ref.remove();
        };
        approve.innerHTML = "Approve";

        var reject = document.createElement('button');
        reject.onclick = function() {
            ref.remove();
        };
        reject.innerHTML = "Reject";

        li.innerHTML = txt;
        li.appendChild(approve);
        li.appendChild(reject);

        modlist.append(li);
    });

    unverified.on('child_removed', function(snap) {
        $('#' + snap.name()).remove();
    });
}

window.addEventListener('load', startup);
