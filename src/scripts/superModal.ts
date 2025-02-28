import { pipedInstances, superModal } from "../lib/dom";
import player from "../lib/player";
import { convertSStoHHMMSS } from "../lib/utils";
import { appendToQueuelist, clearQ, firstItemInQueue } from "./queue";

const [playNow, enqueue, atpContainer, startRadio, downloadBtn, openChannelBtn] = <HTMLCollectionOf<HTMLLIElement>>(<HTMLUListElement>superModal.firstElementChild).children;



superModal.addEventListener('click', e => {
  const el = <HTMLLIElement | HTMLSelectElement>e.target;
  if (el.matches('#psc') && !el.matches('select')) return;
  superModal.classList.toggle('hide');
});


playNow.addEventListener('click', () => {
  player(superModal.dataset.id);
});



enqueue.addEventListener('click', () => {
  if (firstItemInQueue().matches('h1'))
    firstItemInQueue().remove();
  appendToQueuelist(superModal.dataset);
});



async function fetchMix(id: string, api = 0) {
  const knownError = 'No Radios could be found.';
  await fetch(pipedInstances.options[api].value + '/playlists/' + id)
    .then(res => res.json())
    .then(data => {
      if (!data.relatedStreams)
        throw new Error(knownError);

      clearQ();

      for (const stream of data.relatedStreams)
        appendToQueuelist({
          id: stream.url.slice(9),
          title: stream.title,
          thumbnail: stream.thumbnail,
          author: stream.uploaderName,
          duration: convertSStoHHMMSS(stream.duration)
        });

      firstItemInQueue().click();
    })
    .catch(e => {
      if (api < pipedInstances.length - 1)
        return fetchMix(id, api + 1);
      e.message === knownError ? alert(e) : console.error(e);
    });
}


const upcomingIcon = <HTMLElement>(<HTMLAnchorElement>document.getElementById('/upcoming')).firstElementChild;

startRadio.addEventListener('click', async () => {

  upcomingIcon.classList.replace('ri-skip-forward-line', 'ri-loader-3-line');

  await fetchMix('RD' + superModal.dataset.id)

  upcomingIcon.classList.replace('ri-loader-3-line', 'ri-skip-forward-line');

});


const atpSelector = <HTMLSelectElement>atpContainer.firstElementChild;

atpSelector.addEventListener('change', () => {
  superModal.classList.toggle('hide');
});


const download = <HTMLDivElement>document.getElementById('download');
const iframe = <HTMLIFrameElement>download.lastElementChild;
const exitDownloader = <HTMLButtonElement>download.firstElementChild;

downloadBtn.addEventListener('click', () => {
  const url = 'https://shailendramaurya.github.io/racoon/?link=https://youtu.be/' + superModal.dataset.id;
  iframe.src = url;
  download.classList.toggle('hide');

})

exitDownloader.addEventListener('click', () => {
  iframe.src = '';
  download.classList.toggle('hide');
})

openChannelBtn.addEventListener('click', () => {
  open('https://youtube.com' + superModal.dataset.channelUrl);
})