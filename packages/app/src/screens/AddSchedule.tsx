import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import fetch from 'react-native-fetch-polyfill';
import styled from 'styled-components/native';

import authorizedRoute from '../components/common/authorizedRoute';
import Input from '../components/common/Input';
import { TEACHER_URL, FETCH_TIMEOUT, SEARCH_URL } from '../constants/fetch';
import { RawTeacherData } from '../types/schedule';
import { reportError, notify } from '../utils/utils';
import TeacherItem from '../components/add-schedule/TeacherItem';
import { FORM_BORDER_RADIUS, FORM_MARGIN_VERTICAL } from '../constants/style';
import { AppState } from '../types/store';
import { addTeacherSchedule } from '../actions/creators';
import { getUserScheduleFromHTML, parseHTMLFromURL } from '../utils/process-info';

const TeacherContainer = styled.View`
  border-radius: ${FORM_BORDER_RADIUS};
  background-color: ${({ theme }) => theme.foregroundColor};
  margin: ${FORM_MARGIN_VERTICAL} 0;
`;

export default authorizedRoute('Add', function AddSchedule() {
  const teacherSchedules = useSelector(({ user }: AppState) => user.teacherSchedules);
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [teachers, setTeachers] = useState<RawTeacherData[]>([]);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const controller = new AbortController();
  const signal = controller.signal;

  const fetchTeachers = async (teacherQuery: string) => {
    controller.abort();
    try {
      const response = await fetch(`${SEARCH_URL}?query=${teacherQuery}&limit=10`, {
        timeout: FETCH_TIMEOUT,
        signal,
      });
      const { teachers: json } = await response.json();
      const teachersAvailable = json.filter(({ firstName, lastName, email }: RawTeacherData) => {
        const alreadyAdded = teacherSchedules.some((teacherObj) => teacherObj.name === `${firstName} ${lastName}`);
        return email !== null && !alreadyAdded;
      });
      setTeachers(teachersAvailable);
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      reportError(error);
    }
  };

  const addSchedule = ({ firstName, lastName, id }: RawTeacherData) => async () => {
    setAddingTeacher(true);
    try {
      const name = `${firstName} ${lastName}`;
      const url = `${TEACHER_URL}/${id}`;
      const $ = await parseHTMLFromURL(url, { signal });
      const schedule = await getUserScheduleFromHTML($);
      dispatch(addTeacherSchedule({ name, url, schedule }));
      notify('Success', `${name}'s schedule added!`);
      setTeachers([]);
      setQuery('');
    } catch (error) {
      reportError(error);
    }
    setAddingTeacher(false);
  };

  // useEffect cannot have async handlers and React Suspense isn't ready yet
  useEffect(() => {
    if (query.length === 0) {
      controller.abort();
      return setTeachers([]);
    }
    fetchTeachers(query);
    return () => controller.abort();
  }, [query]);

  const teacherItems = teachers.map((teacher) => (
    <TeacherItem key={teacher.id} teacher={teacher} onPress={addSchedule(teacher)} disabled={addingTeacher} />
  ));
  return (
    <>
      <Input placeholder="Teacher Name" value={query} onChangeText={setQuery} />
      <TeacherContainer>
        {teacherItems}
      </TeacherContainer>
    </>
  );
});
