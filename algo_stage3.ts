import { Lesson } from './types';

export const algo_stage3: Lesson = {
  id: 'tut3',
  title: 'STAGE 3. 기억시키기',
  description: '컴퓨터가 값을 기억하고 다시 사용하는 개념을 이해합니다.',
  category: 'tutorial',
  status: 'locked',
  pages: [
    {
      id: 'tut3_p1',
      title: '컴퓨터는 기억을 못 할까?',
      content:
        '컴퓨터는 아무것도 기억하지 않습니다.\n그래서 우리가 “이건 기억해”라고 알려줘야 합니다.',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    },
    {
      id: 'tut3_p2',
      title: '값에 이름을 붙인다',
      content:
        '어떤 값에 이름을 붙이면,\n컴퓨터는 그 이름으로 값을 기억합니다.\n\n이걸 우리는 “기억시키기”라고 생각하면 됩니다.',
      code: '',
      exampleOutput: '',
      traceFlow: [],
      explanations: []
    }
  ],

  conceptProblems: [
    {
      id: 'tut3_c1',
      question: 'Q. 프로그램에서 “기억시키기”가 필요한 이유는 무엇일까요?',
      options: [
        '코드를 길게 만들기 위해서',
        '같은 값을 다시 사용하기 위해서',
        '컴퓨터 속도를 느리게 하기 위해서',
        '화면에 더 많이 보여주기 위해서'
      ],
      answer: '같은 값을 다시 사용하기 위해서',
      hint: '한 번 알려준 정보를 다시 쓰는 상황을 생각해보세요.',
      explanation:
        '값을 기억해두면, 나중에 다시 사용하거나 바꿔서 쓸 수 있습니다.',
      type: 'concept'
    }
  ],

  codingProblems: []
};
