$(document).ready(function (){
    var socket = io.connect();
    var $usernameForm = $('#setUsername');
    var $usernameError = $('#usernameError');
    var $usernameBox = $('#username');
    var $users = $('#users');
    var $messageForm = $('#send-message');
    var $messageBox = $('#message');
    var $chat = $('#chat');
    
    $usernameForm.submit(function (event){
        event.preventDefault();
        socket.emit('new user', $usernameBox.val(), function(data){
            if (data) {
                $('#usernameDiv').hide();
                $('#contentDiv').show();
            }
            else {
                $usernameError.html('Username already exists.');
            }
        });
        $usernameBox.val('');   
    });
    
    socket.on('usernames', function(data){
        var html = '';
        for (i = 0; i < data.length; i++){
            html += '<button id=' + data[i] + 'chat' + '>' + data[i] + '</button><br>';
        }
        $users.html(html);
    });
    
    $messageForm.submit(function (event){
        event.preventDefault();
        socket.emit('send message', $messageBox.val(), function(data){
            $chat.append('<span class="err">' + data + "</span><br>");
        });
        $messageBox.val('');
    });
    
    socket.on('new message', function(data){
        $chat.append('<strong>' + data.username + ': </strong>' + data.msg + "<br>");
    });
    
    socket.on('private chat', function(data){
        $chat.append('<span class="private"><strong>' + data.username + ': </strong>' + data.msg + "</span><br>");
    });
    
});