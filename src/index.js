
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadingMessage = document.getElementById('loading-message');
const loadMoreBtn = document.querySelector('.load-more');
let page = 1;
let searchQuery = '';
let isLoading = false;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  gallery.innerHTML = '';
  page = 1;
  searchQuery = e.target.elements.searchQuery.value.trim();
  searchImages();
});

loadMoreBtn.addEventListener('click', loadMoreImages);

function searchImages() {
  const API_KEY = '36854659-9fbbd2b148ae94915165b1157';
  const API_URL = `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;

  isLoading = true;
  loadingMessage.style.display = 'block';
  loadMoreBtn.disabled = true;

  axios
    .get(API_URL)
    .then(response => {
      const data = response.data;
      isLoading = false;
      loadingMessage.style.display = 'none';
      loadMoreBtn.disabled = false;

      if (data.hits.length > 0) {
        data.hits.forEach(image => {
          const photoCard = createPhotoCard(image);
          gallery.appendChild(photoCard);
        });
        initializeLightbox();
        loadMoreBtn.style.display = 'block';
      } else {
        Notiflix.Report.failure('No Results', 'Sorry, there are no images matching your search query. Please try again.', 'OK');
      }

      if (data.totalHits) {
        Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }

      if (data.totalHits - (page * 40) > 0) {
        loadMoreBtn.style.display = 'block';
      } else {
        loadMoreBtn.style.display = 'none';
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      }
    })
    .catch(error => {
      isLoading = false;
      loadingMessage.style.display = 'none';
      loadMoreBtn.disabled = false;
      Notiflix.Report.failure('Error', 'An error occurred while fetching images. Please try again later.', 'OK');
      console.log(error);
    });
}

function loadMoreImages() {
  if (!isLoading) {
    page++;
    searchImages();
  }
}

function createPhotoCard(image) {
  const photoCard = document.createElement('a');
  photoCard.href = image.largeImageURL;
  photoCard.classList.add('photo-card');
  photoCard.addEventListener('click', (e) => {
    e.preventDefault();
    const lightbox = new SimpleLightbox(gallery.querySelectorAll('.photo-card'));
    const index = Array.from(gallery.children).indexOf(photoCard);
    lightbox.open(index);
  });

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';
  photoCard.appendChild(img);

  const info = document.createElement('div');
  info.classList.add('info');

  const properties = {
    Likes: image.likes,
    Views: image.views,
    Comments: image.comments,
    Downloads: image.downloads
  };

  for (const [key, value] of Object.entries(properties)) {
    const infoItem = document.createElement('p');
    infoItem.classList.add('info-item');
    const boldText = document.createElement('b');
    boldText.textContent = key;
    infoItem.appendChild(boldText);
    infoItem.innerHTML += `: ${value}`;
    info.appendChild(infoItem);
  }

  photoCard.appendChild(info);

  return photoCard;
}

function initializeLightbox() {
  const lightbox = new SimpleLightbox('.gallery a', {});
  lightbox.refresh();
}

// Додайте стиль CSS для приховування кнопки "Load more"
const style = document.createElement('style');
style.innerHTML = `
  .load-more {
    display: none;
  }
`;
document.head.appendChild(style);

