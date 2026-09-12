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

<!-- The page layout already provides the centred .container; nested containers
     and bare <div>s inside a .row were what pushed blocks off-centre. Sections
     below are plain siblings styled by _sass/_academic.scss. -->
<!-- prettier-ignore-start -->

<section class="ac-paper-hero">
  <span class="ac-paper-venue">MLHMI 2026 &middot; Tokyo, Japan</span>
  <h1 class="ac-paper-title">
    SemiFedER: Semi-supervised Federated Averaging for Multimodal Emotion Recognition
  </h1>
  <p class="ac-paper-lede">
    A federated learning pipeline for multimodal emotion recognition that supports partially
    labeled, speaker-partitioned client data.
  </p>
  <p class="ac-paper-authors">
    <strong>Nhut Minh Nguyen</strong> &middot; Thu Thuy Le &middot; Trung Thanh Nguyen &middot; Duc Ngoc Minh Dang
  </p>
  <div class="ac-actions is-center">
    <a class="ac-btn ac-btn-primary" href="https://ieeexplore.ieee.org/document/11644978" target="_blank" rel="noopener">Paper</a>
    <a class="ac-btn" href="https://github.com/nhut-ngnn/SemiFedER" target="_blank" rel="noopener">Code</a>
    <a class="ac-btn" href="#semifeder-citation">BibTeX</a>
  </div>
</section>

<h2 class="ac-section-title">Abstract</h2>

<div class="ac-prose">
  <p>
    Multimodal Emotion Recognition (MER) is a powerful approach for human–computer interaction, leveraging complementary cues across multiple modalities to infer human affect. MER has broad real-world potential in applications such as healthcare monitoring and affect-aware virtual assistants. However, practical deployments face two major challenges: large-scale data is often unlabeled due to the high cost of emotion annotation, and speech signals and transcripts are privacy-sensitive, limiting centralized data collection and training. To address these limitations, we propose SemiFedER, a semi-supervised federated learning framework for MER. SemiFedER performs client-side training in two stages, including supervised pre-training on labeled samples and semi-supervised learning that exploits unlabeled data via confidence-based pseudo-labeling and weak-strong consistency regularization. The server aggregates client updates using Federated Averaging (FedAvg) to learn a global model without sharing raw data. We deploy the representative centralized MER backbones within SemiFedER to assess their effectiveness in this practical setting. Extensive experiments on the MELD dataset under speaker-disjoint non-IID federated splits demonstrate that SemiFedER provides stable performance across labeled ratios and client counts, and achieves competitive improvements in class-balanced evaluation compared to centralized baselines.
  </p>
</div>

<div class="ac-figure">
  {%
    include figure.liquid
    loading="lazy"
    path="assets/img/publication_preview/SemiFedER.jpg"
    alt="SemiFedER pipeline overview"
    class="img-fluid"
    caption="Figure 1. Overview of the SemiFedER pipeline for semi-supervised federated multimodal emotion recognition."
  %}
</div>

<h2 class="ac-section-title">What it does</h2>

<div class="ac-grid">
  <div class="ac-grid-item">
    <span class="ac-grid-index">I</span>
    <h3>Privacy-aware</h3>
    <p>Training is distributed across clients so that raw samples do not need to be centralized.</p>
  </div>
  <div class="ac-grid-item">
    <span class="ac-grid-index">II</span>
    <h3>Semi-supervised</h3>
    <p>Configurable labeled ratios support experiments where only a subset of client samples has emotion annotations.</p>
  </div>
  <div class="ac-grid-item">
    <span class="ac-grid-index">III</span>
    <h3>Multimodal</h3>
    <p>Audio and textual information are extracted and fused for seven-class emotion recognition on MELD.</p>
  </div>
</div>

<h2 class="ac-section-title">Get started locally</h2>

<div class="ac-two-col">
  <div>
    <h3>Setup</h3>
    <p>Python 3.8 or newer is recommended.</p>
    <pre><code class="language-bash">git clone https://github.com/nhut-ngnn/SemiFedER.git
cd SemiFedER
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt</code></pre>
    <p class="ac-note">On Windows PowerShell, activate the environment with <code>.venv\Scripts\Activate.ps1</code>.</p>

    <h3>Recommended federated run</h3>
    <p>Set <code>audio_root</code> in <code>federated/configs/meld.yaml</code> to the MELD audio directory, then run:</p>
    <pre><code class="language-bash">python3 federated/pipeline_runner.py \
  --config federated/configs/meld.yaml</code></pre>
    <p class="ac-note">If <code>pipeline.run_id</code> is configured, it is appended to the generated metadata and feature paths.</p>
  </div>

  <div>
    <h3>Project layout</h3>
    <ul>
      <li><code>centralized/</code> &mdash; preprocessing, feature extraction, and centralized training.</li>
      <li><code>federated/</code> &mdash; client preprocessing, pipeline configuration, and federated training.</li>
      <li><code>src/</code> &mdash; model implementations and shared utilities.</li>
      <li><code>metadata/</code> and <code>features/</code> &mdash; generated splits and extracted feature files.</li>
      <li><code>checkpoints/</code>, <code>logs/</code>, and <code>results/</code> &mdash; experiment outputs.</li>
    </ul>

    <h3>Dataset preparation</h3>
    <p>
      Download MELD and keep its audio files in a stable local directory. The examples below use
      <code>/path/to/MELD</code> for the dataset and <code>/path/to/MELD_audio</code> for extracted audio.
    </p>
  </div>
</div>

<h2 class="ac-section-title" id="semifeder-citation">Cite this work</h2>

<p class="ac-note">If SemiFedER helps your research, please cite the MLHMI 2026 publication.</p>

<div class="ac-cite">
  <pre><code class="language-bibtex">@inproceedings{Nguyen2026SemiFedER,
  title     = {SemiFedER: Semi-supervised Federated Averaging for Multimodal Emotion Recognition},
  author    = {Nguyen, Nhut Minh and Le, Thu Thuy and Nguyen, Thanh Trung and Dang, Duc Ngoc Minh},
  booktitle = {Proceedings of the 7th International Conference on Machine Learning and Human-Computer Interaction (MLHMI 2026)},
  year      = {2026},
  address   = {Tokyo, Japan},
  doi       = {10.23919/MLHMICPS00004.2026.00038},
}</code></pre>
</div>

<h2 class="ac-section-title">Collaborators</h2>

<ul class="ac-people">
  <li><strong>Nhut Minh Nguyen</strong>, FPT University, Vietnam</li>
  <li>Thu Thuy Le, FPT University, Vietnam</li>
  <li>Thanh Trung Nguyen, FPT University, Vietnam</li>
  <li>Duc Ngoc Minh Dang, FPT University, Ho Chi Minh, Vietnam</li>
</ul>

<p class="ac-note">
  Reach out via <a href="mailto:minhnhut.ngnn@gmail.com">minhnhut.ngnn@gmail.com</a> for
  collaborations, demo requests, or dataset access.
</p>

<section class="ac-paper-footer">
  <h2>MLHMI 2026 &middot; Tokyo, Japan</h2>
  <p>Presented at the 7th International Conference on Machine Learning and Human-Computer Interaction.</p>
  <p>SemiFedER is part of an ongoing effort to advance emotionally aware multimodal AI systems.</p>
</section>
<!-- prettier-ignore-end -->
