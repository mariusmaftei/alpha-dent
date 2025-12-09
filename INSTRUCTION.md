Overview
In this task, we provide participants with a set of high-quality dental intraoral photographs. The goal is to annotate them into 9 classes using instance segmentation. An example of the annotation is shown in the figure below as well as every class examples.

Evaluation
Participants' solutions are evaluated using the mAP@50 metric. The metric code is available at this link.

Submission File
For each test image (135 in total), you need to predict a set of masks for each of the 9 pathology classes. Each test image may have multiple predicted masks. Each prediction should be written on a separate line and consist of 4 fields:

patient_id - image ID (filename without extension) class_id - class ID (ranging from 0 to 8, inclusive) confidence - model confidence score poly - polygon defined by a set of points in the format: x1 y1 x2 y2 … xN yN. Each point is normalized to the [0, 1] range. Polygons follow the YOLO format specification.

The submission file must adhere to the following format:

patient_id,class_id,confidence,poly
test_000,0,0.963867,"0.100101 0.900101 0.100102 0.101010 0.901011 0.101012 0.901013 0.901041"
test_001,1,0.845342,"0.200101 0.800101 0.200102 0.201010 0.801011 0.201012 0.801013 0.801041"
...

Citation
More details in paper: https://arxiv.org/abs/2507.22512

@misc{sosnin2025alphadentdatasetautomatedtooth,
title={AlphaDent: A dataset for automated tooth pathology detection},
author={Evgeniy I. Sosnin and Yuriy L. Vasilev and Roman A. Solovyev and Aleksandr L. Stempkovskiy and Dmitry V. Telpukhov and Artem A. Vasilev and Aleksandr A. Amerikanov and Aleksandr Y. Romanov},
year={2025},
eprint={2507.22512},
archivePrefix={arXiv},
primaryClass={cs.CV},
url={https://arxiv.org/abs/2507.22512},
}
Citation
Evgeniy I. Sosnin, Yuriy L. Vasilev, Roman A. Solovyev, Aleksandr L. Stempkovskiy, Dmitry V. Telpukhov, Artem A. Vasilev, Aleksandr A. Amerikanov, and Aleksandr Y. Romanov. AlphaDent: Teeth marking. https://kaggle.com/competitions/alpha-dent, 2025. Kaggle.

Dataset Description
The dataset consists of images (.jpg), annotations (.txt), and a YAML file named yolo_seg_train.yaml. The dataset format follows the Ultralytics/YOLO annotation format for Instance Segmentation tasks. The dataset is divided into three parts: training, validation, and test. For this task, you need to predict masks for the test portion, which has no annotations in the dataset.

A total of 1,320 photographs from 295 patients were used in the study (each patient has multiple photographs available). Nine classes were annotated, as shown in the table below.

Classes description
Class ID English Name Description
0 Abrasion Teeth with mechanical wear of hard tissues
1 Filling Dental fillings of various types
2 Crown Dental crown (restoration)
3 Caries Class 1 Caries in fissures and pits (occlusal surfaces of molars/premolars, buccal surfaces of molars, lingual surfaces of upper incisors).
4 Caries Class 2 Caries on proximal surfaces of molars and premolars.
5 Caries Class 3 Caries on proximal surfaces of incisors/canines without incisal edge involvement.
6 Caries Class 4 Caries on proximal surfaces of incisors/canines with incisal edge involvement.
7 Caries Class 5 Cervical caries (buccal/lingual surfaces).
8 Caries Class 6 Caries on incisal edges of anterior teeth or cusps of molars.
The dataset was split by patients, not by images. 273 patients were included in the training set, and 22 patients were allocated to the validation set. Detailed class statistics for the training and validation sets are provided in the table below.

Train and validation split
Class Name Training Data Validation Data
Images Containing the Class Annotated Masks for the Class Images Containing the Class Annotated Masks for the Class
Abrasion 1,065 5,957 73 409
Filling 695 2,187 48 186
Crown 210 570 9 19
Caries Class 1 341 742 30 62
Caries Class 2 471 1,026 41 73
Caries Class 3 238 474 23 33
Caries Class 4 30 43 3 4
Caries Class 5 328 981 21 81
Caries Class 6 33 52 4 5
Dataset Statistics
Number of male patients: 131
Number of female patients: 162
Average number of images per patient: 4.5
Most images have a resolution exceeding 5000 × 3000 (15 megapixels).
Average number of bounding boxes per image: 9.77
Below is the directory structure of the dataset. It is organized to allow direct training of YOLO models without modifications.

Directory structure
AlphaDent  
│  
└── yolo*seg_train.yaml – YAML file containing class descriptions  
├── images – contains all dataset images, divided into three folders  
│ ├── train  
│ │ ├── p001_F_32_001.jpg  
│ │ ├── p001_F_32_002.jpg  
│ │ └── … (total xxxx images)  
│ ├── valid  
│ │ ├── p001_M_63_001.jpg  
│ │ ├── p001_M_63_002.jpg  
│ │ └── … (total xxxx images)  
│ └── test  
│ ├── test_000.jpg  
│ ├── test_001.jpg  
│ └── … (121 images in total)  
│  
└── labels – contains annotations in the form of polygons and masks  
 ├── train  
 │ ├── p001_F_32_001_masks  
 │ │ ├── 00_class_2.png  
 │ │ ├── 01_class_5.png  
 │ │ └── … (all N masks for 'p001_F_32_001.jpg' in PNG format)  
 │ ├── p001_F_32_002_masks  
 │ │ ├── 00_class_3.png  
 │ │ ├── 01_class_7.png  
 │ │ └── … (all K masks for 'p001_F_32_002.jpg' in PNG format)  
 │ └── … (mask folders for all training images)  
 │ ├── p001_F_32_001.txt  
 │ ├── p001_F_32_002.txt  
 │ └── … (text annotations for all other training images)  
 │  
 ├── valid  
 ├── p001_M_63_001_masks  
 │ ├── 00_class_4.png  
 │ ├── 01_class_5.png  
 │ └── … (all M masks for 'p001_M_63_001.jpg' in PNG format)  
 ├── p001_M_63_002_masks  
 │ ├── 00_class_3.png  
 │ ├── 01_class_7.png  
 │ └── … (all K masks for 'p001_M_63_002.jpg' in PNG format)  
 └── … (mask folders for all validation images)  
 ├── p001_M_63_001.txt  
 ├── p001_M_63_002.txt  
 └── … (text annotations for all other validation images)  
If an image is named p001_F_32_001.jpg, the naming convention is as follows: p001 – Patient ID \_F* – Patient gender (can be M for male or F for female) _32_ – Patient age \_001 – Image ID for the given patient

For masks, the naming structure is as follows. For a file named 01*class_5.png: 01* – Mask ID for the given image \_5 – Class label (ranging from 0 to 8, inclusive).

If an image has the path images/train/p001_F_32_001.jpg, its corresponding annotation is located at labels/train/p001_F_32_001.txt.

Dataset Label Format
One text file per image: Each image in the dataset has a corresponding text file with the same name and a .txt extension.
One line per object: Each line in the text file corresponds to one object in the image.
Object information per line: Each line contains the following information about an object instance: ** Class index of the object: An integer representing the object class (0 to 8, as in Table 1). ** Boundary coordinates of the object: Normalized coordinates (0 to 1) outlining the mask region.
The format of a single line in the segmentation dataset file is as follows: <class-index> <x1> <y1> <x2> <y2> ... <xn> <yn>
Test Data
The test data was prepared later than the training data and annotated separately. This simulates the process of applying trained models to new, unseen data. The test data is not split by patients but consists of individual images. In total, there are 135 test images. The images themselves are publicly available, but their annotations are withheld.

Train and validation split
Class Name Training Data Validation Data
Images Containing the Class Annotated Masks for the Class Images Containing the Class Annotated Masks for the Class
Abrasion 1,065 5,957 73 409
Filling 695 2,187 48 186
Crown 210 570 9 19
Caries Class 1 341 742 30 62
Caries Class 2 471 1,026 41 73
Caries Class 3 238 474 23 33
Caries Class 4 30 43 3 4
Caries Class 5 328 981 21 81
Caries Class 6 33 52 4 5
Dataset Statistics
Number of male patients: 131
Number of female patients: 162
Average number of images per patient: 4.5
Most images have a resolution exceeding 5000 × 3000 (15 megapixels).
Average number of bounding boxes per image: 9.77
Below is the directory structure of the dataset. It is organized to allow direct training of YOLO models without modifications.

Directory structure
AlphaDent  
│  
└── yolo*seg_train.yaml – YAML file containing class descriptions  
├── images – contains all dataset images, divided into three folders  
│ ├── train  
│ │ ├── p001_F_32_001.jpg  
│ │ ├── p001_F_32_002.jpg  
│ │ └── … (total xxxx images)  
│ ├── valid  
│ │ ├── p001_M_63_001.jpg  
│ │ ├── p001_M_63_002.jpg  
│ │ └── … (total xxxx images)  
│ └── test  
│ ├── test_000.jpg  
│ ├── test_001.jpg  
│ └── … (121 images in total)  
│  
└── labels – contains annotations in the form of polygons and masks  
 ├── train  
 │ ├── p001_F_32_001_masks  
 │ │ ├── 00_class_2.png  
 │ │ ├── 01_class_5.png  
 │ │ └── … (all N masks for 'p001_F_32_001.jpg' in PNG format)  
 │ ├── p001_F_32_002_masks  
 │ │ ├── 00_class_3.png  
 │ │ ├── 01_class_7.png  
 │ │ └── … (all K masks for 'p001_F_32_002.jpg' in PNG format)  
 │ └── … (mask folders for all training images)  
 │ ├── p001_F_32_001.txt  
 │ ├── p001_F_32_002.txt  
 │ └── … (text annotations for all other training images)  
 │  
 ├── valid  
 ├── p001_M_63_001_masks  
 │ ├── 00_class_4.png  
 │ ├── 01_class_5.png  
 │ └── … (all M masks for 'p001_M_63_001.jpg' in PNG format)  
 ├── p001_M_63_002_masks  
 │ ├── 00_class_3.png  
 │ ├── 01_class_7.png  
 │ └── … (all K masks for 'p001_M_63_002.jpg' in PNG format)  
 └── … (mask folders for all validation images)  
 ├── p001_M_63_001.txt  
 ├── p001_M_63_002.txt  
 └── … (text annotations for all other validation images)  
If an image is named p001_F_32_001.jpg, the naming convention is as follows: p001 – Patient ID \_F* – Patient gender (can be M for male or F for female) _32_ – Patient age \_001 – Image ID for the given patient

For masks, the naming structure is as follows. For a file named 01*class_5.png: 01* – Mask ID for the given image \_5 – Class label (ranging from 0 to 8, inclusive).

If an image has the path images/train/p001_F_32_001.jpg, its corresponding annotation is located at labels/train/p001_F_32_001.txt.

Dataset Label Format
One text file per image: Each image in the dataset has a corresponding text file with the same name and a .txt extension.
One line per object: Each line in the text file corresponds to one object in the image.
Object information per line: Each line contains the following information about an object instance: ** Class index of the object: An integer representing the object class (0 to 8, as in Table 1). ** Boundary coordinates of the object: Normalized coordinates (0 to 1) outlining the mask region.
The format of a single line in the segmentation dataset file is as follows: <class-index> <x1> <y1> <x2> <y2> ... <xn> <yn>
Test Data
The test data was prepared later than the training data and annotated separately. This simulates the process of applying trained models to new, unseen data. The test data is not split by patients but consists of individual images. In total, there are 135 test images. The images themselves are publicly available, but their annotations are withheld.

Example solution
You can find example solution in this repository on github

Files
2777 files

Size
5.02 GB

Type
jpg, txt, csv + 1 other

License
Apache 2.0

sample_submission.csv(19.65 kB)

5 of 5 columns

id

patient_id

class_id

confidence

poly
Label Count
0.00 - 28.40 29
28.40 - 56.80 28
56.80 - 85.20 29
85.20 - 113.60 28
113.60 - 142.00 28
142.00 - 170.40 29
170.40 - 198.80 28
198.80 - 227.20 29
227.20 - 255.60 28
255.60 - 284.00 29
Label Count
0.00 - 28.40 29
28.40 - 56.80 28
56.80 - 85.20 29
85.20 - 113.60 28
113.60 - 142.00 28
142.00 - 170.40 29
170.40 - 198.80 28
198.80 - 227.20 29
227.20 - 255.60 28
255.60 - 284.00 29
0
284
test_000
1%
test_001
1%
Other (279)
98%
Label Count
0.00 - 0.80 29
0.80 - 1.60 29
1.60 - 2.40 34
2.40 - 3.20 42
4.00 - 4.80 29
4.80 - 5.60 29
5.60 - 6.40 33
6.40 - 7.20 28
7.20 - 8.00 32
Label Count
0.00 - 0.80 29
0.80 - 1.60 29
1.60 - 2.40 34
2.40 - 3.20 42
4.00 - 4.80 29
4.80 - 5.60 29
5.60 - 6.40 33
6.40 - 7.20 28
7.20 - 8.00 32
0
8
Label Count
0.10 - 0.19 29
0.19 - 0.28 24
0.28 - 0.37 24
0.37 - 0.46 31
0.46 - 0.55 26
0.55 - 0.64 30
0.64 - 0.72 31
0.72 - 0.81 25
0.81 - 0.90 34
0.90 - 0.99 31
Label Count
0.10 - 0.19 29
0.19 - 0.28 24
0.28 - 0.37 24
0.37 - 0.46 31
0.46 - 0.55 26
0.55 - 0.64 30
0.64 - 0.72 31
0.72 - 0.81 25
0.81 - 0.90 34
0.90 - 0.99 31
0.1
0.99
1

unique value
0
test_000
7
0.9743030299560049
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
1
test_000
8
0.8790533413815096
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
2
test_000
4
0.8876930379699671
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
3
test_001
1
0.8267638784949631
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
4
test_001
2
0.1637478030367923
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
5
test_001
7
0.9143280337826662
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
6
test_002
4
0.21976142822165529
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
7
test_003
3
0.41228947166642793
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
8
test_003
3
0.2499901801457308
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
9
test_004
5
0.1729515266417649
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
10
test_004
8
0.3162057544880739
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
11
test_005
0
0.3657046651514868
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
12
test_005
3
0.47923597196174905
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
13
test_005
0
0.6568461574246697
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
14
test_006
4
0.7802689739319412
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
15
test_007
2
0.5716318049251954
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
16
test_008
6
0.6190506406759774
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
17
test_009
3
0.41785805927795583
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
18
test_009
6
0.9570648507707564
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
19
test_010
4
0.5345658479088261
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
20
test_011
5
0.7074282121391137
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
21
test_011
5
0.2631104964137534
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
22
test_011
4
0.722598574571828
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
23
test_012
0
0.6220914838463428
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
24
test_012
7
0.5866621884061569
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
25
test_012
4
0.29654026944253237
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
26
test_013
8
0.6296289813740622
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
27
test_013
1
0.10431982615243325
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
28
test_014
4
0.544857775129768
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
29
test_015
3
0.8956425617533801
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
30
test_015
5
0.5461060776182776
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
31
test_015
5
0.4059271014736675
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
32
test_016
0
0.8339496238561664
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
33
test_017
6
0.8294108664640234
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
34
test_017
2
0.6658726548188894
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
35
test_018
2
0.6493386942714993
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
36
test_019
1
0.2889859734109981
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
37
test_019
8
0.12079463872570638
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
38
test_020
4
0.9710976201468501
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
39
test_020
2
0.7783281649111823
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
40
test_020
2
0.848675109851925
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
41
test_021
7
0.7776962138400265
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
42
test_021
2
0.22926714588546002
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
43
test_021
2
0.7911451873681137
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
44
test_022
4
0.10790268875379531
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
45
test_023
2
0.9648878385881079
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
46
test_023
7
0.3821106631781911
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
47
test_024
2
0.5349081942813347
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
48
test_025
6
0.6275157173299556
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
49
test_025
4
0.12644623975588884
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
50
test_025
5
0.6229082660457107
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
51
test_026
7
0.9074266415776855
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
52
test_026
1
0.5647489946065314
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
53
test_027
4
0.7549021522151748
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
54
test_027
0
0.3239661420026486
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
55
test_028
1
0.6553368200283731
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
56
test_028
3
0.5716056004478077
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
57
test_029
3
0.43330839007285193
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
58
test_029
1
0.11449482718386633
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
59
test_030
6
0.6574674889023019
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
60
test_030
6
0.8781205157360839
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
61
test_030
8
0.9869107385001894
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
62
test_031
1
0.5629945375334783
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
63
test_031
7
0.45579468293815195
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
64
test_032
3
0.6034461211711718
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
65
test_032
3
0.7742222321189212
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
66
test_033
2
0.3768233684960982
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
67
test_033
7
0.9785113260763733
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
68
test_034
3
0.6580119896856961
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
69
test_034
3
0.3512764857001862
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
70
test_035
0
0.8939793067803781
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
71
test_035
8
0.6801807030315276
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
72
test_036
0
0.5902791969357524
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
73
test_036
6
0.5439745636137248
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
74
test_037
2
0.7075340648558355
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
75
test_037
6
0.2808194936942735
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
76
test_037
6
0.22581910717551326
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
77
test_038
0
0.5180932598236415
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
78
test_038
3
0.5873754622274087
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
79
test_039
4
0.8298131224591747
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
80
test_040
7
0.5895026603597009
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
81
test_040
1
0.13334168094856957
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
82
test_040
1
0.10909389204521525
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
83
test_041
8
0.8890396718184581
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
84
test_041
0
0.4483655827303291
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
85
test_041
6
0.8034282305298891
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
86
test_042
5
0.9276507688558636
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
87
test_042
6
0.8609612287310552
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
88
test_042
8
0.11407079429325723
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
89
test_043
8
0.7244275498709232
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
90
test_043
5
0.8474803795876041
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
91
test_044
6
0.7256174508756319
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
92
test_044
4
0.43862731607607763
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
93
test_045
4
0.5827017075284201
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
94
test_045
8
0.2906840331557513
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
95
test_046
7
0.7395240783531589
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
96
test_046
6
0.8380838068986337
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
97
test_047
7
0.5839483660205838
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
98
test_047
2
0.6059924382544064
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
99
test_048
3
0.3717951878800704
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
100
test_048
8
0.6944030527838075
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
101
test_048
0
0.3610064589013976
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
102
test_049
1
0.9708187274423649
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
103
test_049
2
0.4785734373605375
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
104
test_049
2
0.3122005708239176
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
105
test_050
2
0.6050284087679181
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
106
test_050
5
0.9059273787628676
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
107
test_051
7
0.865125260147718
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
108
test_052
8
0.5033320001663818
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
109
test_053
4
0.38340386961677975
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
110
test_054
0
0.1444103211279912
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
111
test_054
2
0.6637438037768048
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
112
test_055
2
0.36963908243589017
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
113
test_055
7
0.13833040994525264
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
114
test_055
2
0.3123995737754638
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
115
test_056
3
0.6751892725285217
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
116
test_056
3
0.9310164980914041
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
117
test_057
3
0.7750986306663519
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
118
test_057
6
0.6191834921790713
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
119
test_057
8
0.6206956006460994
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
120
test_058
5
0.8888840353942724
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
121
test_059
5
0.3021846804157008
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
122
test_059
6
0.9048017675840614
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
123
test_059
8
0.7159788706912154
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
124
test_060
0
0.5634772768811795
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
125
test_060
1
0.5263965575695067
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
126
test_061
5
0.2102642065714411
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
127
test_061
3
0.3071789680726542
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
128
test_061
3
0.9129639554413812
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
129
test_062
0
0.6732556980435516
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
130
test_062
5
0.7082415336179948
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
131
test_062
5
0.17001432768197505
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
132
test_063
0
0.8472163850269775
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
133
test_063
1
0.6378708815673191
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
134
test_063
4
0.44151813955601216
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
135
test_064
2
0.8990508415945783
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
136
test_064
3
0.8875779042624945
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
137
test_064
1
0.5352399169694317
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
138
test_065
5
0.8487585887571374
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
139
test_066
8
0.26951195808662737
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
140
test_066
0
0.10745956713944858
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
141
test_067
8
0.38182352805651454
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
142
test_067
0
0.13988486914066614
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
143
test_067
5
0.5092404674238517
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
144
test_068
6
0.4010401824894525
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
145
test_069
7
0.5270791299871812
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
146
test_070
8
0.45848925448521727
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
147
test_071
1
0.41104345753933913
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
148
test_071
3
0.3950691738031048
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
149
test_071
7
0.1243230395169912
0.1 0.9 0.9 0.9 0.9 0.1 0.1 0.1
