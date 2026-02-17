
import { Track } from './types';
import { algorithmTrack } from './curriculum_algorithm';
import { pythonBasicTrack } from './curriculum_python_basic';
import { cCompleteTrack } from './curriculum_c_complete';

// 각 트랙별 파일에서 데이터를 가져와 합칩니다.
export const ALL_TRACKS: Track[] = [
  algorithmTrack,
  pythonBasicTrack,
  cCompleteTrack
];
