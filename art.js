var db = undefined;
var auth = undefined;

function add1(x) { return x + 1; }

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

    $('#submit_link').click(function() { $('#submit_form').toggle(); });

    db.child('total_votes').once('value', function(snap) {
        var total_votes = snap.val();

        var x = Math.floor(Math.random() * total_votes);
        db.child('facts').once('value', function(snap) {
            snap.forEach(function(snap) {
                var ref = snap.ref();
                var fact = snap.val();
                if(x < fact.votes) {
                    $('#current_fact').html(fact.fact);
                    $('#upvote_button').click(function () {
                        ref.child('votes').transaction(add1);
                        db.child('total_votes').transaction(add1);
                        $('#upvote_button').attr('disabled', 'disabled');
                    });
                    return true;
                }
                else {
                    x -= fact.votes;
                }
            });
        });
    });

    auth = new FirebaseSimpleLogin(db, function(error, user) {
        if(user) {
            enableModerator();
            $('#admin_link').html('logout').click(function() {
                location.hash = "";
                $('#admin_link').hide();
                $('#verify').hide();
                auth.logout();
            }).show();
        }
        else {
            console.info("" + location.hash);
            if("" + location.hash == "#admin") {
                window.setTimeout(function () { auth.login('persona'); },
                                  10);
            }
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
            db.child('total_votes').transaction(add1);
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
