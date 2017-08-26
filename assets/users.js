
$(document).ready(function () {
  console.log('users ready!');

  function initUserDetails(data) {
    $('#sidebar').html(data);

    $('#hide-sidebar').click(function () {
      $('#sidebar').prop('hidden', 'hidden');
    });
  }

  $('.edit-user').click(function () {
    $('#sidebar').prop('hidden', false);
  });

  $('.edit-user').click(function () {
    $.get('/user/' + $(this).data('id'), function (data) {

      initUserDetails(data);

      $('#edit-user-form').submit(function (event) {

        event.preventDefault();

        var $form = $(this);
        const url = $form.attr('action');

        const postData = {};
        postData.csrf_token = $form.find('input[name="csrf_token"]').val();
        postData.name = $form.find('input[name="name"]').val();
        postData.email = $form.find('input[name="email"]').val();
        postData.phone = $form.find('input[name="phone"]').val();
        postData.user_type = $form.find('select[name="user_type"]').val();

        var posting = $.post(url, postData);

        posting.done(function (data) {
          initUserDetails(data);
          $('#userSave').prop('disabled', true);
        });
      });
    });
  });
});
