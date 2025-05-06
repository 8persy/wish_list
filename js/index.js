document.getElementById('imageUpload').addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('imagePreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById('tagsBtn').addEventListener('click', function (e) {
  e.stopPropagation();
  const dropdown = document.getElementById('tagsDropdown');
  dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
});

function closePopup() {
  document.getElementById('editPopup').style.display = 'none';
  document.querySelector('.overlay').style.display = 'none'
}
