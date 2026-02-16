import { Lesson } from './types';

export const algo_stage6: Lesson = {
  id: 'tut6',
  title: 'STAGE 6. 반복하기',
  description: '같은 일을 여러 번 자동으로 처리하는 개념을 이해합니다.',
  category: 'tutorial',
  status: 'locked',
  pages: [
    {
      id: 'tut6_p1',
      title: '왜 반복이 필요할까?',
      content:
        '사람이 같은 일을 여러 번 하면 피곤합니다.\n하지만 컴퓨터는 같은 일을 몇 번이든 정확하게 할 수 있습니다.',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    },
    {
      id: 'tut6_p2',
      title: '반복은 자동화다',
      content:
        '반복을 사용하면,\n한 번 시킨 일을 여러 번 자동으로 처리할 수 있습니다.\n\n이것이 컴퓨터가 잘하는 일입니다.',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    }
  ],

  conceptProblems: [
    {
      id: 'tut6_c1',
      question: 'Q. 프로그램에서 반복이 중요한 이유는 무엇일까요?',
      options: [
        '코드를 어렵게 만들기 위해서',
        '같은 일을 자동으로 여러 번 하기 위해서',
        '컴퓨터를 느리게 만들기 위해서',
        '출력을 숨기기 위해서'
      ],
      answer: '같은 일을 자동으로 여러 번 하기 위해서',
      hint: '사람 대신 컴퓨터가 해준다고 생각해보세요.',
      explanation:
        '반복을 사용하면 사람이 직접 하지 않아도 같은 작업을 여러 번 처리할 수 있습니다.',
      type: 'concept'
    }
  ],

  codingProblems: []
};
