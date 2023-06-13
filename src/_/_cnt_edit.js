import { getSiteId, link } from '@kenzap/k-cloud';

export const HTMLContent = (_this, __) => {
 
    return `
        <div class="container p-edit">
            <div class="d-flex justify-content-between bd-highlight mb-3">
                <nav class="bc" aria-label="breadcrumb"></nav>
                <div class="">
                    <a style="margin-right:16px;" class="preview-link nounderline d-none" target="_blank" href="#">${ __('template') }<i class="mdi mdi-monitor"></i></a>
                    <button class="btn btn-primary btn-add" type="button">${ __('Add locale') }</button>
                </div>
            </div>
            <div class="row">

                <div class="col-lg-12 grid-margin stretch-card">
                    <div class="card border-white shadow-sm">
                        <div class="card-body">
                        <h4 class="card-title">${ __('Translating') } ${ _this.state.slug }</h4>
                        <p class="form-text">
                            ${ __('Choose <a href="#">locale</a></code> from the list to start translation or hit add locale button.') }
                        </p>

                        <div class="row">
                            <div class="col-sm-12">
                                <div class="table-responsive">
                                    <table
                                        class="table table-hover table-borderless align-middle table-striped table-p-list" style="min-width: 800px;">
                                        <thead>

                                        </thead>
                                        <tbody>

                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

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

        <div class="position-fixed bottom-0 p-2 m-4 end-0 align-items-center">
            <div class="toast hide align-items-center text-white bg-dark border-0" role="alert" aria-live="assertive"
                aria-atomic="true" data-bs-delay="3000">
                <div class="d-flex">
                    <div class="toast-body"></div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"
                        aria-label="Close"></button>
                </div>
            </div>
        </div>
        
    `;
}