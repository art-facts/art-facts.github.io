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

    $('#reload_link').click(function() { pickFact(); });

    pickFact();

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
            if("" + location.hash == "#admin") {
                window.setTimeout(function () { auth.login('persona'); },
                                  10);
            }
        }
    });
}

function pickFact() {
    db.child('total_votes').once('value', function(snap) {
        var total_votes = snap.val();

        var x = Math.random() * total_votes;
        //console.log("=== " + x + " / " + total_votes);
        db.child('facts').once('value', function(snap) {
            snap.forEach(function(snap) {
                var ref = snap.ref();
                var fact = snap.val();
                //console.log(x + " <? " + fact.votes);
                if(x < fact.votes && fact.fact != $('#current_fact').html()) {
                    $('#current_fact').html(fact.fact);
                    $('#upvote_button').off('click');
                    $('#upvote_button').click(function () {
                        ref.child('votes').transaction(add1);
                        db.child('total_votes').transaction(add1);
                        $('#upvote_button').attr('disabled', 'disabled');
                    }).removeAttr('disabled');
                    return true;
                }
                else {
                    x -= fact.votes;
                }
            });
        });
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
