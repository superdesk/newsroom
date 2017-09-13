
$(document).ready(function () {
    function initUserDetails(data) {
        $('#sidebar').html(data);

        $('#hide-sidebar').click(function () {
            $('#sidebar').prop('hidden', 'hidden');
        });

        submitForm();

        $('#resetPassword').click(function () {
            processTokenRequest('reset_password');
        });
    }

    function processTokenRequest(tokenType) {
        const $form = $('#edit-user-form');
        const userId = $form.find('input[name="id"]').val();
        const url = `/users/${userId}/${tokenType}`;

        var posting = $.post(url);

        posting.done(function (data) {
            initUserDetails(data);
        });

        posting.fail(function (data) {
            initUserDetails(data.responseText);
        });
    }

    function submitForm() {
        $('#edit-user-form').submit(function (event) {

            event.preventDefault();

            var $form = $(this);
            const url = $form.attr('action');

            const postData = {};
            postData.csrf_token = $form.find('input[name="csrf_token"]').val();
            postData.id = $form.find('input[name="id"]').val();
            postData.name = $form.find('input[name="name"]').val();
            postData.email = $form.find('input[name="email"]').val();
            postData.phone = $form.find('input[name="phone"]').val();
            postData.user_type = $form.find('select[name="user_type"]').val();
            postData.company = $form.find('select[name="company"]').val();
            postData.is_enabled = $form.find('input[name="is_enabled"]').is(':checked');
            postData.is_approved = $form.find('input[name="is_approved"]').is(':checked');

            var posting = $.post(url, postData);

            posting.done(function (data) {
                initUserDetails(data);
                $('#userSave').prop('disabled', true);
                $('#refresh').prop('hidden', false);
            });

            posting.fail(function (data) {
                initUserDetails(data.responseText);
            });
        });
    }

    function initEvents() {
        $('.edit-user').click(function () {
            $('#sidebar').prop('hidden', false);

            $.get('/users/' + $(this).data('id'), function (data) {
                initUserDetails(data);
            });
        });
    }

    function refreshContent() {
        $.get('/users/', function (data) {
            $('body').html(data);
        });
    }

    $('#refresh').click(function () {
        refreshContent();
    });

    $('#create-user').click(function () {
        $('#sidebar').prop('hidden', false);
        $.get('/users/new', function (data) {
            initUserDetails(data);
        });
    });

    initEvents();
});
