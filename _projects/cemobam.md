---
layout: page
title: CemoBAM
description: Multimodal emotion recognition with cross-modal heterogeneous graphs and CBAM fusion.
permalink: /projects/cemobam/
img: assets/img/publication_preview/CemoBAM.jpg
importance: 1
category: research
github: https://github.com/nhut-ngnn/CemoBAM
github_stars: nhut-ngnn/CemoBAM
related_publications: true
hide_title: true
hide_description: true
---

<!-- prettier-ignore-start -->
<section class="py-5 text-center">
  <div class="container">
    <h1 class="h2 font-weight-bold mb-3">
      CemoBAM: Advancing Multimodal Emotion Recognition through Heterogeneous Graph Networks and Cross-Modal Attention Mechanisms
    </h1>
    <p class="lead mb-0 text-muted">
      A dual-stream architecture that integrates a Cross-modal Heterogeneous Graph Attention Network (CH-GAT) with a Cross-modal CBAM fusion block.
    </p>
    <p class="mt-4 mb-2 text-muted">
      Nhut Minh Nguyen · Thu Thuy Le · Thanh Trung Nguyen · Duc Tai Phan · Anh Khoa Tran · Duc Ngoc Minh Dang
    </p>
    <div class="d-flex justify-content-center flex-wrap gap-2">
      <a class="btn btn-primary m-1" href="https://ieeexplore.ieee.org/document/11181320" target="_blank" rel="noopener">Paper</a>
      <a class="btn btn-outline-primary m-1" href="https://github.com/nhut-ngnn/CemoBAM" target="_blank" rel="noopener">Code</a>
      <a class="btn btn-outline-secondary m-1" href="#cemobam-citation">BibTeX</a>
    </div>
  </div>
</section>


<section class="py-5">
  <div class="container">
    <h2 class="text-center mb-4">Abstract</h2>
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <p class="text-justify small">
          Multimodal Speech Emotion Recognition (SER) offers significant advantages over unimodal approaches by integrating diverse information streams such as audio and text. However, effectively fusing these heterogeneous modalities remains a significant challenge. We propose CemoBAM, a novel dualstream architecture that effectively integrates the Heterogeneous Graph Attention Network (CH-GAT) with the Cross-modal Convolutional Block Attention Mechanism (xCBAM). In CemoBAM architecture, the CH-GAT constructs a heterogeneous graph that models intra- and inter-modal relationships, employing multi-head attention to capture fine-grained dependencies across audio and text feature embeddings. The xCBAM enhances feature refinement through a cross-modal transformer with a modified 1D-CBAM, employing bidirectional cross-attention and channel-spatial attention to emphasize emotionally salient features. The CemoBAM architecture surpasses previous state-of-the-art (SOTA) methods by 0.32% on IEMOCAP and 3.25% on ESD datasets. Comprehensive ablation studies validate the impact of Top-K graph construction parameters, fusion strategies, and the complementary contributions of both modules. The results highlight CemoBAM’s robustness and potential for advancing multimodal SER applications.
        </p>
      </div>
      <div class="mt-4 text-center">
      {% include figure.liquid loading="eager" path="assets/img/publication_preview/CemoBAM.jpg" alt="CemoBAM pipeline overview" class="img-fluid rounded shadow-sm border" %}
      <p class="mt-2 text-muted"><em>Figure 1. Overview of the CemoBAM pipeline illustrating the CH-GAT and xCBAM fusion process for multimodal emotion recognition.</em></p>
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
            <h3 class="h5 text-uppercase text-primary">Summary</h3>
            <p class="mb-0">
              CH-GAT captures inter- and intra-modal relationships while xCBAM refines channel-spatial signals, enabling robust fusion on noisy speech datasets.
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4 mt-3">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <h3 class="h5 text-uppercase text-primary">Why it matters</h3>
            <p class="mb-0">
              CemoBAM delivers +0.32% accuracy on IEMOCAP and +3.25% on ESD compared with prior multimodal SER systems by unifying graph reasoning and attention-based calibration.
            </p>
          </div>
        </div>
      </div>
      <div class="col-md-4 mt-3">
        <div class="card h-100 shadow-sm border-0">
          <div class="card-body">
            <h3 class="h5 text-uppercase text-primary">Key ingredients</h3>
            <ul class="mb-0 pl-3">
              <li>Cross-modal Heterogeneous Graph Attention (CH-GAT)</li>
              <li>Cross-modal CBAM (xCBAM) refinement</li>
              <li>Gated dual-stream fusion with residual safeguards</li>
            </ul>
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
        <pre><code class="language-bash">git clone https://github.com/nhut-ngnn/CemoBAM.git
cd CemoBAM
conda create --name cemobam python=3.8
conda activate cemobam
pip install -r requirements.txt</code></pre>
        <h3 class="h5 mt-4">Run Experiments</h3>
        <pre><code class="language-bash"># Grid-search top-k graph density
bash selected_topK.sh

# Default training run
bash run_training.sh

# Evaluate saved checkpoints
bash run_eval.sh</code></pre>
      </div>
      <div class="col-lg-6">
        <h3 class="h5">Datasets &amp; Features</h3>
        <ul>
          <li><strong>IEMOCAP</strong> - four emotion classes with aligned audio-text transcripts.</li>
          <li><strong>ESD</strong> - five multilingual emotion classes covering diverse speakers.</li>
        </ul>
        <p>
          Pre-computed <code>.pkl</code> files for both modalities are provided to accelerate experimentation.
          Request access via the GitHub issues board if you need the processed features.
        </p>
        <h3 class="h5 mt-4">Evaluation Assets</h3>
        <ul>
          <li>Attention visualisations for per-modality saliency exploration.</li>
          <li>Confusion matrices logged for every experiment run.</li>
          <li>Structured ablation scripts covering top-k, fusion strategy, and regularisation factors.</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="py-5" id="cemobam-citation">
  <div class="container">
    <h2 class="text-center mb-4">Cite This Work</h2>
    <p class="text-center text-muted">If CemoBAM helps your research, please cite the APNOMS 2025 publication.</p>
    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <pre><code class="language-bibtex">@inproceedings{nguyen2025CemoBAM,
  title     = {CemoBAM: Advancing Multimodal Emotion Recognition through Heterogeneous Graph Networks and Cross-Modal Attention Mechanisms},
  author    = {Nguyen, Nhut Minh and Le, Thu Thuy and Nguyen, Thanh Trung and Phan, Duc Tai and Tran, Anh Khoa and Dang, Duc Ngoc Minh},
  booktitle = {2025 Asia-Pacific Network Operations and Management Symposium (APNOMS)},
  address   = {Kaohsiung, Taiwan},
  year      = {2025},
  month     = {September},
  doi       = {10.23919/apnoms67058.2025.11181320}
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
          <li class="py-1">Duc Tai Phan, FPT University, Vietnam</li>
          <li class="py-1">Anh Khoa Tran, Modeling Evolutionary Algorithms Simulation &amp; AI, Vietnam</li>
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
    <h2 class="mb-3">APNOMS 2025 · Kaohsiung, Taiwan</h2>
    <p class="mb-1">Presented at the 25th Asia-Pacific Network Operations and Management Symposium.</p>
    <p class="text-muted mb-0">CemoBAM is part of an ongoing effort to advance emotionally aware multimodal AI systems.</p>
  </div>
</section>
<!-- prettier-ignore-end -->
