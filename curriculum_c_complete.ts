
import { Track } from './types';

export const cCompleteTrack: Track = {
  id: 'c_complete',
  title: 'C언어 개념완성',
  description: '컴퓨터 시스템의 핵심인 C언어를 통해 하드웨어와 소프트웨어의 가교 역할을 하는 프로그래밍의 본질을 마스터합니다.',
  category: 'language',
  iconType: 'c',
  lessons: [
    {
      id: 'c_step1',
      title: 'STEP 1. C언어의 시작',
      description: 'C언어의 기본 구조와 환경 설정, 출력을 배웁니다.',
      category: 'language',
      status: 'current',
      pages: [
        {
          id: 'c_s1_p1',
          title: 'Hello World',
          content: 'C언어의 가장 기본적인 출력 함수인 printf를 배우고 프로그램의 구조를 파악합니다.',
          code: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
          exampleOutput: 'Hello, World!',
          traceFlow: [0, 2, 3, 4],
          explanations: [
            { id: 'c_ex1', codeLine: 0, title: '헤더 파일', text: '표준 입출력 함수를 사용하기 위해 stdio.h를 포함합니다.', type: 'blue', badge: 'inc' },
            { id: 'c_ex2', codeLine: 2, title: '메인 함수', text: '프로그램이 실행되는 시작점입니다.', type: 'purple', badge: 'main' },
            { id: 'c_ex3', codeLine: 3, title: '출력', text: 'printf 함수를 통해 화면에 문자를 출력합니다.', type: 'green', badge: '1' }
          ]
        }
      ],
      conceptProblems: [],
      codingProblems: []
    },
    {
      id: 'c_step2',
      title: 'STEP 2. 변수와 자료형',
      description: '데이터를 저장하는 상자인 변수와 다양한 데이터 타입을 학습합니다.',
      category: 'language',
      status: 'locked',
      pages: [],
      conceptProblems: [],
      codingProblems: []
    },
    {
      id: 'c_step3',
      title: 'STEP 3. 제어문과 반복문',
      description: '프로그램의 흐름을 제어하는 조건문과 반복문을 배웁니다.',
      category: 'language',
      status: 'locked',
      pages: [],
      conceptProblems: [],
      codingProblems: []
    },
    {
      id: 'c_step4',
      title: 'STEP 4. 배열과 문자열',
      description: '연속된 데이터를 다루는 배열과 C언어 특유의 문자열 처리법을 익힙니다.',
      category: 'language',
      status: 'locked',
      pages: [],
      conceptProblems: [],
      codingProblems: []
    },
    {
      id: 'c_step5',
      title: 'STEP 5. 포인터와 메모리',
      description: 'C언어의 꽃, 메모리 주소를 직접 다루는 포인터의 개념을 정복합니다.',
      category: 'language',
      status: 'locked',
      pages: [],
      conceptProblems: [],
      codingProblems: []
    },
    {
      id: 'c_finish',
      title: 'C Master Achieved! 🏆',
      description: '축하합니다! C언어의 방대한 산맥을 모두 넘으셨습니다.',
      category: 'language',
      status: 'locked',
      pages: [
        {
          id: 'c_fin_p',
          title: '과정을 마치며',
          content: '이제 당신은 컴퓨터가 어떻게 데이터를 처리하는지 깊이 있게 이해하게 되었습니다. 이 지식은 어떤 언어를 배우더라도 큰 자산이 될 것입니다.',
          code: 'printf("C Master: Success\\n");',
          exampleOutput: 'C Master: Success',
          traceFlow: [0],
          explanations: []
        }
      ],
      conceptProblems: [],
      codingProblems: []
    }
  ]
};
