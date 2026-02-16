
import { Track } from './types';
import { py_basic_stage1 } from './py_basic_stage1';
import { py_basic_stage2 } from './py_basic_stage2';
import { py_basic_stage3 } from './py_basic_stage3';
import { py_basic_stage4 } from './py_basic_stage4';
import { py_basic_stage5 } from './py_basic_stage5';
import { py_basic_stage6 } from './py_basic_stage6';
import { py_basic_stage7 } from './py_basic_stage7';
import { py_basic_stage8 } from './py_basic_stage8';
import { py_basic_stage9 } from './py_basic_stage9';
import { py_basic_stage10 } from './py_basic_stage10';
import { py_basic_stage11 } from './py_basic_stage11';
import { py_basic_stage12 } from './py_basic_stage12';

export const pythonBasicTrack: Track = {
  id: 'py_basic',
  title: 'Python 개념완성',
  description: '가장 직관적인 언어인 파이썬으로 프로그래밍의 기초를 다집니다.',
  category: 'language',
  iconType: 'python',
  lessons: [
    py_basic_stage1, // STEP 1: 출력 & 변수
    py_basic_stage2, // STEP 2: 입력 & 형 변환
    py_basic_stage3, // STEP 3: 연산자
    py_basic_stage4, // STEP 4: 조건문 (if)
    py_basic_stage5, // STEP 5: 반복문 (for / while)
    py_basic_stage6, // STEP 6: 자료구조 (list / tuple / dict / set)
    py_basic_stage7, // STEP 7: 문자열 처리
    py_basic_stage8, // STEP 8: 함수 (Function)
    py_basic_stage9, // STEP 9: 클래스 & 객체
    py_basic_stage10, // STEP 10: 파일 입출력
    py_basic_stage11, // STEP 11: 예외 처리 & 모듈
    py_basic_stage12, // STEP 12: 총 정리 & 종합 평가
    {
      id: 'py_complete',
      title: 'Course Completed! 🎉',
      description: '축하합니다! 파이썬 기초 트랙의 모든 과정을 마쳤습니다.',
      category: 'language',
      status: 'locked',
      pages: [
        {
          id: 'p_finish',
          title: '입문 과정을 마치며',
          content:
            '이제 여러분은 파이썬의 핵심 문법을 모두 마스터했습니다. 다음 트랙에서 더 복잡한 알고리즘이나 프로젝트에 도전해보세요!\n\n여러분의 여정은 이제 시작입니다. 코딩으로 세상을 바꿔보세요.',
          code:
            'print("Hello, Python Master!")\nprint("Keep Coding, Stay Creative!")',
          exampleOutput:
            'Hello, Python Master!\nKeep Coding, Stay Creative!',
          traceFlow: [0, 1],
          variableHistory: [
            {},
            {}
          ],
          explanations: []
        }
      ],
      conceptProblems: [],
      codingProblems: []
    }
  ]
};
