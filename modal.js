document.addEventListener("DOMContentLoaded", function() {
    // Inject modal HTML
    const modalHTML = `
    <div class="modal fade" id="cardModal" tabindex="-1" aria-labelledby="cardModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content" style="background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); border-radius: 20px; overflow: hidden; box-shadow: 0 15px 30px rgba(0,0,0,0.2);">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title theme-sub-text" id="cardModalLabel" style="font-weight: 600;"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center">
            <img id="cardModalImg" src="" class="img-fluid rounded mb-3 shadow-sm" style="max-height: 60vh; object-fit: contain;">
            <p id="cardModalDesc" class="mt-2" style="font-size: 1.1rem; color: #333;"></p>
            <small id="cardModalDate" class="text-muted"></small>
          </div>
        </div>
      </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Inject CSS for blur backdrop and card hover
    const styleHTML = `
    <style>
      .card {
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.15) !important;
      }
      .modal-backdrop {
          background-color: rgba(0, 0, 0, 0.6) !important;
      }
      .modal-backdrop.show {
          opacity: 1 !important;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
      }
    </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styleHTML);

    // Setup click events
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const imgEl = this.querySelector('img');
            const titleEl = this.querySelector('h5');
            const descEl = this.querySelector('p');
            const dateEl = this.querySelector('.text-muted');

            const img = imgEl ? imgEl.src : '';
            const title = titleEl ? titleEl.innerText : '';
            const desc = descEl ? descEl.innerText : '';
            const date = dateEl ? dateEl.innerText : '';

            document.getElementById('cardModalImg').src = img;
            document.getElementById('cardModalImg').style.display = img ? 'block' : 'none';
            document.getElementById('cardModalLabel').innerText = title;
            document.getElementById('cardModalDesc').innerText = desc;
            document.getElementById('cardModalDate').innerText = date;

            const modal = new bootstrap.Modal(document.getElementById('cardModal'));
            modal.show();
        });
    });
});
