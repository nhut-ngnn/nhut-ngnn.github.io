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

<!-- The page layout already provides the centred .container; nested containers
     and bare <div>s inside a .row were what pushed blocks off-centre. Sections
     below are plain siblings styled by _sass/_academic.scss. -->
<!-- prettier-ignore-start -->

<section class="ac-paper-hero">
  <span class="ac-paper-venue">APNOMS 2025 &middot; Kaohsiung, Taiwan</span>
  <h1 class="ac-paper-title">
    CemoBAM: Advancing Multimodal Emotion Recognition through Heterogeneous Graph Networks and Cross-Modal Attention Mechanisms
  </h1>
  <p class="ac-paper-lede">
    A dual-stream architecture that integrates a Cross-modal Heterogeneous Graph Attention Network
    (CH-GAT) with a Cross-modal CBAM fusion block.
  </p>
  <p class="ac-paper-authors">
    <strong>Nhut Minh Nguyen</strong> &middot; Thu Thuy Le &middot; Thanh Trung Nguyen &middot; Duc Tai Phan &middot; Anh Khoa Tran &middot; Duc Ngoc Minh Dang
  </p>
  <div class="ac-actions is-center">
    <a class="ac-btn ac-btn-primary" href="https://ieeexplore.ieee.org/document/11181320" target="_blank" rel="noopener">Paper</a>
    <a class="ac-btn" href="https://github.com/nhut-ngnn/CemoBAM" target="_blank" rel="noopener">Code</a>
    <a class="ac-btn" href="#cemobam-citation">BibTeX</a>
  </div>
</section>

<h2 class="ac-section-title">Abstract</h2>

<div class="ac-prose">
  <p>
    Multimodal Speech Emotion Recognition (SER) offers significant advantages over unimodal approaches by integrating diverse information streams such as audio and text. However, effectively fusing these heterogeneous modalities remains a significant challenge. We propose CemoBAM, a novel dual-stream architecture that effectively integrates the Heterogeneous Graph Attention Network (CH-GAT) with the Cross-modal Convolutional Block Attention Mechanism (xCBAM). In CemoBAM architecture, the CH-GAT constructs a heterogeneous graph that models intra- and inter-modal relationships, employing multi-head attention to capture fine-grained dependencies across audio and text feature embeddings. The xCBAM enhances feature refinement through a cross-modal transformer with a modified 1D-CBAM, employing bidirectional cross-attention and channel-spatial attention to emphasize emotionally salient features. The CemoBAM architecture surpasses previous state-of-the-art (SOTA) methods by 0.32% on IEMOCAP and 3.25% on ESD datasets. Comprehensive ablation studies validate the impact of Top-K graph construction parameters, fusion strategies, and the complementary contributions of both modules. The results highlight CemoBAM’s robustness and potential for advancing multimodal SER applications.
  </p>
</div>

<div class="ac-figure">
  {%
    include figure.liquid
    loading="lazy"
    path="assets/img/publication_preview/CemoBAM.jpg"
    alt="CemoBAM pipeline overview"
    class="img-fluid"
    caption="Figure 1. Overview of the CemoBAM pipeline illustrating the CH-GAT and xCBAM fusion process for multimodal emotion recognition."
  %}
</div>

<h2 class="ac-section-title">What it does</h2>

<div class="ac-grid">
  <div class="ac-grid-item">
    <span class="ac-grid-index">I</span>
    <h3>Summary</h3>
    <p>
      CH-GAT captures inter- and intra-modal relationships while xCBAM refines channel-spatial
      signals, enabling robust fusion on noisy speech datasets.
    </p>
  </div>
  <div class="ac-grid-item">
    <span class="ac-grid-index">II</span>
    <h3>Why it matters</h3>
    <p>
      CemoBAM delivers +0.32% accuracy on IEMOCAP and +3.25% on ESD compared with prior multimodal
      SER systems by unifying graph reasoning and attention-based calibration.
    </p>
  </div>
  <div class="ac-grid-item">
    <span class="ac-grid-index">III</span>
    <h3>Key ingredients</h3>
    <ul>
      <li>Cross-modal Heterogeneous Graph Attention (CH-GAT)</li>
      <li>Cross-modal CBAM (xCBAM) refinement</li>
      <li>Gated dual-stream fusion with residual safeguards</li>
    </ul>
  </div>
</div>

<h2 class="ac-section-title">Get started locally</h2>

<div class="ac-two-col">
  <div>
    <h3>Setup</h3>
    <pre><code class="language-bash">git clone https://github.com/nhut-ngnn/CemoBAM.git
cd CemoBAM
conda create --name cemobam python=3.8
conda activate cemobam
pip install -r requirements.txt</code></pre>

    <h3>Run experiments</h3>
    <pre><code class="language-bash"># Grid-search top-k graph density
bash selected_topK.sh

# Default training run
bash run_training.sh

# Evaluate saved checkpoints
bash run_eval.sh</code></pre>
  </div>

  <div>
    <h3>Datasets &amp; features</h3>
    <ul>
      <li><strong>IEMOCAP</strong> &mdash; four emotion classes with aligned audio-text transcripts.</li>
      <li><strong>ESD</strong> &mdash; five multilingual emotion classes covering diverse speakers.</li>
    </ul>
    <p>
      Pre-computed <code>.pkl</code> files for both modalities are provided to accelerate experimentation.
      Request access via the GitHub issues board if you need the processed features.
    </p>

    <h3>Evaluation assets</h3>
    <ul>
      <li>Attention visualisations for per-modality saliency exploration.</li>
      <li>Confusion matrices logged for every experiment run.</li>
      <li>Structured ablation scripts covering top-k, fusion strategy, and regularisation factors.</li>
    </ul>
  </div>
</div>

<h2 class="ac-section-title" id="cemobam-citation">Cite this work</h2>

<p class="ac-note">If CemoBAM helps your research, please cite the APNOMS 2025 publication.</p>

<div class="ac-cite">
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

<h2 class="ac-section-title">Collaborators</h2>

<ul class="ac-people">
  <li><strong>Nhut Minh Nguyen</strong>, FPT University, Vietnam</li>
  <li>Thu Thuy Le, FPT University, Vietnam</li>
  <li>Thanh Trung Nguyen, FPT University, Vietnam</li>
  <li>Duc Tai Phan, FPT University, Vietnam</li>
  <li>Anh Khoa Tran, Modeling Evolutionary Algorithms Simulation &amp; AI, Vietnam</li>
  <li>Duc Ngoc Minh Dang, FPT University, Ho Chi Minh, Vietnam</li>
</ul>

<p class="ac-note">
  Reach out via <a href="mailto:minhnhut.ngnn@gmail.com">minhnhut.ngnn@gmail.com</a> for
  collaborations, demo requests, or dataset access.
</p>

<section class="ac-paper-footer">
  <h2>APNOMS 2025 &middot; Kaohsiung, Taiwan</h2>
  <p>Presented at the 25th Asia-Pacific Network Operations and Management Symposium.</p>
  <p>CemoBAM is part of an ongoing effort to advance emotionally aware multimodal AI systems.</p>
</section>
<!-- prettier-ignore-end -->
