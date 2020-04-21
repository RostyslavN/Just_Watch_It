//gets elements from page
const movie = document.querySelector('.movies-section'),
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

const getVideo = (type, id) => {
	let youtube = movie.querySelector('.youtube');

	fetch(`https://api.themoviedb.org/3/${type}/${id}/videos?api_key=20ea6a54518a25a3b110a6646d33a414&language=en`)
		.then((value) => {
			if (value.status !== 200) {
				return Promise.reject(value)
			}
			return value.json();
		})
		.then((output) => {
			let videoFrame = '<p class="bold-text" style="margin: 20px 0 15px 0">Trailer</p>';
			if (output.results.length === 0) {
				videoFrame += '<p>Unfortunately, the video is missing.</p>';
			}
			output.results.length = 1;
			output.results.forEach((item) => {
				videoFrame += `<iframe width="560" height="315" src="https://www.youtube.com/embed/${item.key}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
			});

			youtube.innerHTML = videoFrame;
		})
		.catch((reason) => {
			youtube.innerHTML = 'Video is missing';
			console.error('error: ' + reason.status);
		});
};


function showFullInfo() {
	let url = '';
	if(this.dataset.type === 'movie') {
		url = `https://api.themoviedb.org/3/movie/${this.dataset.id}?api_key=20ea6a54518a25a3b110a6646d33a414&language=en`;
	} else if(this.dataset.type === 'tv') {
		url = `https://api.themoviedb.org/3/tv/${this.dataset.id}?api_key=20ea6a54518a25a3b110a6646d33a414&language=en`;
	} else {
		modalText.innerHTML = 'An error occurred, please try again later';
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
			const poster = output.poster_path ? posterUrl + output.poster_path : './img/poster-none.png';
			movie.style.width = '100%'
			movie.innerHTML = `
				<div class="full-info">
					<img src="${poster}" alt="${output.name || output.title}" class="full-info__img">
					<div class="full-info__main">
						<p class="movie-name">${output.name || output.title}</p>
						<hr class="horizontal-line">
						<p><span class="bold-text">Description:</span> ${output.overview}</p>
						<hr class="horizontal-line">
						<p><span class="bold-text">Rating:</span> ${output.vote_average}</p>
						${(output.budget) ? `<p><span class="bold-text">Budget:</span> ${output.budget}$` : ''} 
						<p><span class="bold-text">Premiere:</span> ${output.release_date || output.first_air_date}</p>
						${(output.last_episode_to_air) ? `<p><span class="bold-text">Seasons:</span> ${output.number_of_seasons}, <span class="bold-text">episodes:</span> ${output.last_episode_to_air.episode_number}</p>`: ''}
						${(output.homepage) ? `<a href="${output.homepage}" target="_blank" class="bold-text">Official website</a>` : ``}
						${(output.imdb_id) ? `<a href="https://imdb.com/title/${output.imdb_id}" target="_blank" class="bold-text">Page on IMDB.com</a>` : ``}
						<hr class="horizontal-line">
						<div class='youtube'></div>
					</div>
					
				</div>
			`;

			getVideo(this.dataset.type, this.dataset.id);

		})
		.catch((reason) => {
			modalText.innerHTML = 'Oops... something went wrong.';
			modalWindow.style.display = "block";
			console.error('error: ' + reason.status);
		});
};


//Events handlers

document.addEventListener('DOMContentLoaded', () => {
	movie.innerHTML = '<div class="spinner spinner-extra"></div>';
	fetch('https://api.themoviedb.org/3/movie/top_rated?api_key=20ea6a54518a25a3b110a6646d33a414&language=en-US&page=1&region=UA')
		.then((value) => {
			if (value.status !== 200) {
				return Promise.reject(value);
			}
			return value.json();
		})
		.then((output) => {
			let inner = '<p class="list__title">Top Rated</p>';
			if (output.results.length === 0 || output.results[0].media_type === 'person') {
				modalText.innerHTML = "Your search did't match anything.";
				modalWindow.style.display = "block";
			};
			output.results.forEach((item) => {
				let nameItem = item.name || item.title;
				const poster = item.poster_path ? posterUrl + item.poster_path : './img/poster-none.png';
				let dataInfo = '';
				if(item.media_type !== 'person') { 
					dataInfo = `data-id="${item.id}" data-type="movie"`;
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
			modalText.innerHTML = 'Oops... something went wrong.';
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
