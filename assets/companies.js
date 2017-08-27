
$(document).ready(function () {
  console.log('companies ready!');

  function initCompanyDetails(data) {
    $('#sidebar').html(data);

    $('#hide-sidebar').click(function () {
      $('#sidebar').prop('hidden', 'hidden');
    });

    submitForm();
  }

  function refreshContent() {
    $.get('/companies/', function (data) {
      $('body').html(data);
    });
  }

  function submitForm() {
    $('#edit-company-form').submit(function (event) {

        event.preventDefault();

        var $form = $(this);
        const url = $form.attr('action');

        const postData = {};
        postData.csrf_token = $form.find('input[name="csrf_token"]').val();
        postData.id = $(this).data('id');
        postData.name = $form.find('input[name="name"]').val();
        postData.sd_subscriber_id = $form.find('input[name="sd_subscriber_id"]').val();
        postData.phone = $form.find('input[name="phone"]').val();
        postData.contact_name = $form.find('input[name="contact_name"]').val();
        postData.is_enabled = $form.find('input[name="is_enabled"]').is(":checked");

        var posting = $.post(url, postData);

        posting.done(function (data) {
          initCompanyDetails(data);
          $('#companySave').prop('disabled', true);
          $('#create-company').prop('hidden', 'hidden');
          $('#refresh').prop('hidden', false);
        });

        posting.fail(function(data) {
          initCompanyDetails(data.responseText);
        });
      });
  }

  $('#refresh').click(function () {
    refreshContent();
  });

  $('.edit-company').click(function () {
    $('#sidebar').prop('hidden', false);
  });

  $('.edit-company').click(function () {
    $.get('/companies/' + $(this).data('id'), function (data) {
      initCompanyDetails(data);
    });
  });

  $('#create-company').click(function () {
    $('#sidebar').prop('hidden', false);
  });

  $('#create-company').click(function () {
    $.get('/companies/new', function (data) {
      initCompanyDetails(data);
    });
  });
});
