---
layout: page
title: SemiFedER
description: Semi-supervised federated averaging for privacy-aware multimodal emotion recognition.
permalink: /projects/semifeder/
img: assets/img/publication_preview/SemiFedER.jpg
importance: 2
category: research
github: https://github.com/nhut-ngnn/SemiFedER
github_stars: nhut-ngnn/SemiFedER
related_publications: true
hide_title: true
hide_description: true
---

<!-- prettier-ignore-start -->
<section class="py-5 text-center">
  <div class="container">
    <h1 class="h2 font-weight-bold mb-3">
      SemiFedER: Semi-supervised Federated Averaging for Multimodal Emotion Recognition
    </h1>
    <p class="lead mb-0 text-muted">
      A federated learning pipeline for multimodal emotion recognition that supports partially labeled, speaker-partitioned client data.
    </p>
    <p class="mt-4 mb-2 text-muted">
      Nhut Minh Nguyen &middot; Thu Thuy Le &middot; Trung Thanh Nguyen &middot; Duc Ngoc Minh Dang
    </p>
    <div class="d-flex justify-content-center flex-wrap gap-2">
        <a class="btn btn-primary m-1" href="https://ieeexplore.ieee.org/document/11644978" target="_blank" rel="noopener">Paper</a>
      <a class="btn btn-outline-primary m-1" href="https://github.com/nhut-ngnn/SemiFedER" target="_blank" rel="noopener">Code</a>
      <a class="btn btn-outline-secondary m-1" href="#semifeder-citation">BibTeX</a>
    </div>
  </div>
</section>

<section class="py-5">
  <div class="container">
    <h2 class="text-center mb-4">Abstract</h2>
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <p class="text-justify small">
          Multimodal Emotion Recognition (MER) is a powerful approach for human–computer interaction, leveraging complementary cues across multiple modalities to infer human affect. MER has broad real-world potential in applications such as healthcare monitoring and affect-aware virtual assistants. However, practical deployments face two major challenges: large-scale data is often unlabeled due to the high cost of emotion annotation, and speech signals and transcripts are privacy-sensitive, limiting centralized data collection and training. To address these limitations, we propose SemiFedER, a semi-supervised federated learning framework for MER. SemiFedER performs client-side training in two stages, including supervised pre-training on labeled samples and semi-supervised learning that exploits unlabeled data via confidence-based pseudo-labeling and weak-strong consistency regularization. The server aggregates client updates using Federated Averaging (FedAvg) to learn a global model without sharing raw data. We deploy the representative centralized MER backbones within SemiFedER to assess their effectiveness in this practical setting. Extensive experiments on the MELD dataset under speaker-disjoint non-IID federated splits demonstrate that SemiFedER provides stable performance across labeled ratios and client counts, and achieves competitive improvements in class-balanced evaluation compared to centralized baselines.
        </p>
      </div>
      <div class="mt-4 text-center">
        {% include figure.liquid loading="eager" path="assets/img/publication_preview/SemiFedER.jpg" alt="SemiFedER pipeline overview" class="img-fluid rounded shadow-sm border" %}
        <p class="mt-2 text-muted"><em>Figure 1. Overview of the SemiFedER pipeline for semi-supervised federated multimodal emotion recognition.</em></p>
      </div>
    </div>
  </div>
</section>

<section class="py-4">
  <div class="container">
    <div class="row">
      <div class="col-md-4 mt-3">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <h3 class="h5 text-uppercase text-primary">Privacy-aware</h3>
            <p class="mb-0">Training is distributed across clients so that raw samples do not need to be centralized.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4 mt-3">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <h3 class="h5 text-uppercase text-primary">Semi-supervised</h3>
            <p class="mb-0">Configurable labeled ratios support experiments where only a subset of client samples has emotion annotations.</p>
          </div>
        </div>
      </div>
      <div class="col-md-4 mt-3">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <h3 class="h5 text-uppercase text-primary">Multimodal</h3>
            <p class="mb-0">Audio and textual information are extracted and fused for seven-class emotion recognition on MELD.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-5">
  <div class="container">
    <h2 class="text-center mb-4">Get Started Locally</h2>
    <div class="row">
      <div class="col-lg-6">
        <h3 class="h5">Setup</h3>
        <p>Python 3.8 or newer is recommended.</p>
        <pre><code class="language-bash">git clone https://github.com/nhut-ngnn/SemiFedER.git
cd SemiFedER
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt</code></pre>
        <p class="small text-muted">On Windows PowerShell, activate the environment with <code>.venv\Scripts\Activate.ps1</code>.</p>

        <h3 class="h5 mt-4">Recommended Federated Run</h3>
        <p>Set <code>audio_root</code> in <code>federated/configs/meld.yaml</code> to the MELD audio directory, then run:</p>
        <pre><code class="language-bash">python3 federated/pipeline_runner.py \
  --config federated/configs/meld.yaml</code></pre>
        <p class="small text-muted mb-0">If <code>pipeline.run_id</code> is configured, it is appended to the generated metadata and feature paths.</p>
      </div>

      <div class="col-lg-6">
        <h3 class="h5">Project Layout</h3>
        <ul>
          <li><code>centralized/</code> &mdash; preprocessing, feature extraction, and centralized training.</li>
          <li><code>federated/</code> &mdash; client preprocessing, pipeline configuration, and federated training.</li>
          <li><code>src/</code> &mdash; model implementations and shared utilities.</li>
          <li><code>metadata/</code> and <code>features/</code> &mdash; generated splits and extracted feature files.</li>
          <li><code>checkpoints/</code>, <code>logs/</code>, and <code>results/</code> &mdash; experiment outputs.</li>
        </ul>

        <h3 class="h5 mt-4">Dataset Preparation</h3>
        <p>
          Download MELD and keep its audio files in a stable local directory. The examples below use
          <code>/path/to/MELD</code> for the dataset and <code>/path/to/MELD_audio</code> for extracted audio.
        </p>
      </div>
    </div>
  </div>
</section>


<section class="py-5" id="semifeder-citation">
  <div class="container">
    <h2 class="text-center mb-4">Cite This Work</h2>
    <p class="text-center text-muted">If SemiFedER helps your research, please cite the MLHMI 2026 publication.</p>
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <pre><code class="language-bibtex">@inproceedings{Nguyen2026SemiFedER,
  title = {SemiFedER: Semi-supervised Federated Averaging for Multimodal Emotion Recognition},
  author = {Nguyen, Nhut Minh and Le, Thu Thuy and Nguyen, Thanh Trung and Dang, Duc Ngoc Minh},
  booktitle = {Proceedings of the 7th International Conference on Machine Learning and Human-Computer Interaction (MLHMI 2026)},
  year = {2026},
  address = {Tokyo, Japan},
  doi = {10.23919/MLHMICPS00004.2026.00038},
}</code></pre>
      </div>
    </div>
  </div>
</section>


<section class="py-5">
  <div class="container">
    <h2 class="text-center mb-4">Collaborators</h2>
    <div class="row justify-content-center text-center">
      <div class="col-lg-8">
        <ul class="list-unstyled mb-0">
          <li class="py-1"><strong>Nhut Minh Nguyen</strong>, FPT University, Vietnam</li>
          <li class="py-1">Thu Thuy Le, FPT University, Vietnam</li>
          <li class="py-1">Thanh Trung Nguyen, FPT University, Vietnam</li>
          <li class="py-1">Duc Ngoc Minh Dang, FPT University, Ho Chi Minh, Vietnam</li>
        </ul>
        <p class="mt-4">
          Reach out via <a href="mailto:minhnhut.ngnn@gmail.com">minhnhut.ngnn@gmail.com</a> for collaborations, demo requests, or dataset access.
        </p>
      </div>
    </div>
  </div>
</section>

<section class="py-5 text-center">
  <div class="container">
    <h2 class="mb-3">MLHMI 2026 · Tokyo, Japan</h2>
    <p class="mb-1">Presented at 2027 8th International Conference on
Machine Learning and Human-Computer Interaction.</p>
    <p class="text-muted mb-0">SemiFedER is part of an ongoing effort to advance emotionally aware multimodal AI systems.</p>
  </div>
</section>
<!-- prettier-ignore-end -->
