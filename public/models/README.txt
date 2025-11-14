Place your pre-trained TensorFlow.js models here.

Expected structure:

public/models/
  asl/
    model.json
    group1-shard1ofX.bin
    group1-shard2ofX.bin
    ...
  fsl/
    model.json
    group1-shard1ofX.bin
    group1-shard2ofX.bin
    ...

Requirements:
- Model must accept a [1, 63] input tensor (21 landmarks × x,y,z relative to wrist) and output 26 logits (A-Z).
- Class order must be strictly: A..Z.

How to export a Keras model to TF.js:
- pip install tensorflowjs
- tensorflowjs_converter --input_format=tf_saved_model --output_format=tfjs_graph_model <input> <output>
  or for Keras H5/JSON: tensorflowjs_converter --input_format=keras <input.h5> <output_dir>

After placing files, reload the app. The loader will pick the correct model based on language setting (ASL or FSL).