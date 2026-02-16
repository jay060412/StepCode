
import { Track } from './types';
import { algorithmTrack } from './curriculum_algorithm';
import { pythonBasicTrack } from './curriculum_python_basic';
import { cBasicTrack } from './curriculum_c_basic';

// 각 트랙별 파일에서 데이터를 가져와 합칩니다.
export const ALL_TRACKS: Track[] = [
  algorithmTrack,
  pythonBasicTrack,
  {
    id: 'py_adv',
    title: 'Python 실무 심화',
    description: '리스트, 딕셔너리와 같은 복합 자료형과 함수의 고급 활용을 배웁니다.',
    category: 'language',
    iconType: 'python',
    lessons: [
      {
        id: 'py_adv_1',
        title: '데이터 구조 마스터',
        description: '많은 데이터를 효율적으로 다루는 리스트와 반복문의 조합을 배웁니다.',
        category: 'language',
        status: 'locked',
        pages: [],
        conceptProblems: [],
        codingProblems: []
      }
    ]
  },
  cBasicTrack,
  {
    id: 'c_adv',
    title: 'C언어 메모리 관리',
    description: 'C언어의 핵심인 포인터와 동적 메모리 할당을 학습합니다.',
    category: 'language',
    iconType: 'c',
    lessons: [
      {
        id: 'c_adv_1',
        title: '포인터의 기초',
        description: '메모리 주소의 개념과 포인터 변수의 활용을 배웁니다.',
        category: 'language',
        status: 'locked',
        pages: [],
        conceptProblems: [],
        codingProblems: []
      }
    ]
  }
];
