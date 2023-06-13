import { __html, html } from '@kenzap/k-cloud';

export const HTMLContent = (__) => {
 
    return `
        <div class="container p-edit">
            <div class="d-flex justify-content-between bd-highlight mb-3">
                <nav class="bc" aria-label="breadcrumb"></nav>
                <div class="d-none-">
                    <button class="btn btn-primary btn-new-app d-flex align-items-center" type="button">
                        <span class="d-flex" role="status" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle me-2" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </span> ${ __html('New application') }
                    </button>
                </div>
            </div>
            <div class="row">
                <div id="mydata-chart"></div>
            </div>
        </div>

        <div class="modal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"></h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">

                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary btn-modal"></button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"></button>
                    </div>
                </div>
            </div>
        </div>
        
    `;
}