//gets elements from page
const searchForm = document.querySelector('.search-form'),
	searchTitle = document.querySelector('.search-title'),
	movie = document.querySelector('.movies-section'),
	posterUrl = 'https://image.tmdb.org/t/p/w342',
	modalWindow = document.querySelector("#modal-window"),
	closeBtn = document.querySelector(".close-btn"),
	modalText = document.querySelector('.modal-text');

//functions
const addEventMedia = () => {
	const media = movie.querySelectorAll('img[data-id]');
	media.forEach((elem) => {
		elem.style.cursor = 'pointer';
		elem.addEventListener('click', showFullInfo);
	});
};


const apiSearch = (event) => {
	event.preventDefault();
	searchText = document.querySelector('.search__input').value;
	if(searchText.trim().length === 0) {
		modalText.innerHTML = 'Поле пошуку не повинне бути пустим!';
		modalWindow.style.display = "block";
		return;
	}
	movie.innerHTML = '<div class="spinner"></div>';
	fetch(`https://api.themoviedb.org/3/search/multi?api_key=20ea6a54518a25a3b110a6646d33a414&language=uk&query=${searchText}`)
		.then((value) => {
			if (value.status !== 200) {
				return Promise.reject(value);
			}
			return value.json();
		})
		.then((output) => {
			let inner = '';
			if (output.results.length === 0 || output.results[0].media_type === 'person') {
				modalText.innerHTML = "По вашому запиту нічого не знайдено.";
				modalWindow.style.display = "block";
			};
			output.results.forEach((item) => {
				let nameItem = item.name || item.title;
				const poster = item.poster_path ? posterUrl + item.poster_path : './img/poster-none.png';
				let dataInfo = '';
				if(item.media_type !== 'person') { 
					dataInfo = `data-id="${item.id}" data-type="${item.media_type}"`;
					inner +=
					`<div class="inner-media">
						<img src="${poster}" alt="${nameItem}" class="img_poster" ${dataInfo}>
						<p class="inner-text">${nameItem}</p>
					</div>
					`;
				}
			});
			movie.innerHTML = inner;
			
			addEventMedia();
		})
		.catch((reason) => {
			modalText.innerHTML = 'Упс... щось пішло не так(';
			modalWindow.style.display = "block";
			console.error('error: ' + reason.status);
		});
}



const getVideo = (type, id) => {
	let youtube = movie.querySelector('.youtube');

	fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=20ea6a54518a25a3b110a6646d33a414&language=uk`)
		.then((value) => {
			if (value.status !== 200) {
				return Promise.reject(value)
			}
			return value.json();
		})
		.then((output) => {
			let videoFrame = '<p class="bold-text" style="margin: 20px 0 15px 0">Трейлер</p>';
			if (output.results.length === 0) {
				videoFrame += '<p>На жаль, відео відстутнє.</p>';
			}
			output.results.length = 1;
			output.results.forEach((item) => {
				videoFrame += `<iframe width="560" height="315" src="https://www.youtube.com/embed/${item.key}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
			});

			youtube.innerHTML = videoFrame;
		})
		.catch((reason) => {
			youtube.innerHTML = 'Відео відсутнє';
			console.error('error: ' + reason.status);
		});
};


function showFullInfo() {
	let url = '';
	if(this.dataset.type === 'movie') {
		url = `https://api.themoviedb.org/3/movie/${this.dataset.id}?api_key=20ea6a54518a25a3b110a6646d33a414&language=uk`;
	} else if(this.dataset.type === 'tv') {
		url = `https://api.themoviedb.org/3/tv/${this.dataset.id}?api_key=20ea6a54518a25a3b110a6646d33a414&language=uk`;
	} else {
		modalText.innerHTML = 'Сталася помилка, повторіть пізніше';
		modalWindow.style.display = "block";
	}
	fetch(url)
		.then((value) => {
			if (value.status !== 200) {
				return Promise.reject(value)
			}
			return value.json();
		})
		.then((output) => {
			searchTitle.style.display = 'none';
			searchForm.style.display = 'none';
			const poster = output.poster_path ? posterUrl + output.poster_path : './img/poster-none.png';
			movie.style.width = '100%'
			movie.innerHTML = `
				<div class="full-info">
					<img src="${poster}" alt="${output.name || output.title}" class="full-info__img">
					<div class="full-info__main">
						<p class="movie-name">${output.name || output.title}</p>
						<hr class="horizontal-line">
						<p><span class="bold-text">Опис:</span> ${output.overview}</p>
						<hr class="horizontal-line">
						<p><span class="bold-text">Рейтинг:</span> ${output.vote_average}</p>
						${(output.budget) ? `<p><span class="bold-text">Бюджет:</span> ${output.budget}$` : ''} 
						<p><span class="bold-text">Прем'єра:</span> ${output.release_date || output.first_air_date}</p>
						${(output.last_episode_to_air) ? `<p><span class="bold-text">Сезонів:</span> ${output.number_of_seasons}, <span class="bold-text">серій:</span> ${output.last_episode_to_air.episode_number}</p>`: ''}
						${(output.homepage) ? `<a href="${output.homepage}" target="_blank" class="bold-text">Офійна сторінка</a>` : ``}
						${(output.imdb_id) ? `<a href="https://imdb.com/title/${output.imdb_id}" target="_blank" class="bold-text">Сторінка на IMDB.com</a>` : ``}
						<hr class="horizontal-line">
						<div class='youtube'></div>
					</div>
					
				</div>
			`;

			getVideo(this.dataset.type, this.dataset.id);

		})
		.catch((reason) => {
			modalText.innerHTML = 'Упс... щось пішло не так(';
			modalWindow.style.display = "block";
			console.error('error: ' + reason.status);
		});
};


//Events handlers
searchForm.addEventListener('submit', apiSearch);

document.addEventListener('DOMContentLoaded', () => {
	movie.innerHTML = '<div class="spinner"></div>';
	fetch('https://api.themoviedb.org/3/trending/all/week?api_key=20ea6a54518a25a3b110a6646d33a414&language=uk')
		.then((value) => {
			if (value.status !== 200) {
				return Promise.reject(value);
			}
			return value.json();
		})
		.then((output) => {
			let inner = '<p class="popular-week">Популярне за тиждень</p>';
			if (output.results.length === 0 || output.results[0].media_type === 'person') {
				modalText.innerHTML = "По вашому запиту нічого не знайдено.";
				modalWindow.style.display = "block";
			};
			output.results.forEach((item) => {
				let nameItem = item.name || item.title;
				const poster = item.poster_path ? posterUrl + item.poster_path : './img/poster-none.png';
				let dataInfo = '';
				if(item.media_type !== 'person') { 
					dataInfo = `data-id="${item.id}" data-type="${item.media_type}"`;
					inner +=
					`<div class="inner-media">
						<img src="${poster}" alt="${nameItem}" class="img_poster" ${dataInfo}>
						<p class="popular-week__text">${nameItem}</p>
					</div>
					`;
				}
			});
			movie.innerHTML = inner;
			
			addEventMedia();
		})
		.catch((reason) => {
			modalText.innerHTML = 'Упс... щось пішло не так(';
			modalWindow.style.display = "block";
			console.error('error: ' + reason.status);
		});
});

window.addEventListener('click', () => {
	if (event.target === modalWindow) {
		modalWindow.style.display = "none";
	}
});
closeBtn.addEventListener('click', () => {
	modalWindow.style.display = "none";
});